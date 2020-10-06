import * as React from 'react';
import styles from './EmployeeTracking.module.scss';
import { IEmployeeTrackingProps } from './IEmployeeTrackingProps';
import { escape } from '@microsoft/sp-lodash-subset';
import DataTable, { createTheme } from 'react-data-table-component';
import { Modal } from "office-ui-fabric-react/lib/Modal";
import RichTextEditor from 'react-rte';
import SimpleReactValidator from 'simple-react-validator';
import Loader from 'react-loader-spinner';
import { SPHttpClient, SPHttpClientResponse, SPHttpClientConfiguration } from '@microsoft/sp-http';
import commonUtility from '../../Utility';
const util: commonUtility = new commonUtility();

export interface ET {
  ActivityLog: IActivityLog[];
  SaveActivityLog: IActivityLog[];
  showPopup: boolean;
  HoursAlert: boolean;
  value: any;
  showmainerror: boolean;
  ExtraHourse: any;
  showloader: boolean;
  SuccessPopup: boolean;
}
export interface IActivityLog {
  Title: string;
  Description: any;
  Category: string;
  Time: number;
}

export default class EmployeeTracking extends React.Component<IEmployeeTrackingProps, ET> {
  public validator;
  public constructor(props: IEmployeeTrackingProps, state: ET) {
    super(props);
    this.state = {
      ActivityLog: [] as IActivityLog[],
      SaveActivityLog: [] as IActivityLog[],
      showPopup: false,
      HoursAlert: false,
      showmainerror: false,
      ExtraHourse: '',
      showloader: false,
      SuccessPopup: false,
      value: RichTextEditor.createEmptyValue(),
    };
    this.validator = new SimpleReactValidator({ autoForceUpdate: this });
  }
  public componentDidMount() {
    this.getActivityLogData();
  }
  public openPopup() {
    this.setState({ showPopup: true });
  }
  public closePopup() {
    this.setState({ showPopup: false });
  }
  public closeSuccessPopup() {
    this.setState({ SuccessPopup: false });
    window.location.reload();
  }
  public GetFormattedDate() {
    var todayTime = new Date();
    var month = (todayTime.getMonth() + 1);
    var day = (todayTime.getDate());
    var year = (todayTime.getFullYear());
    return month + "/" + day + "/" + year;
  }
  public async getActivityLogData() {
    var loginid = this.props.context.pageContext.legacyPageContext.userId
    var ListName = 'Activity Log';
    var today = this.GetFormattedDate();
    var currentContext: any = this.props.context;
    var fetchURL = currentContext.pageContext.web.absoluteUrl + `/_api/web/lists/getbytitle('` + ListName + `')/items?$expand=Author&$select=*,Author/Title,FileLeafRef&$filter=Author eq '` + loginid + `'and Date ge '` + today + `'`;
    var ActivityLogDataList = await util.getListData(fetchURL);
    var tempArray = [];
    ActivityLogDataList.value.map((item) => {
      tempArray.push({ ID: item.ID, Title: item.Title, Description: item.Description, Category: item.Category, Time: item.Time });
    });
    console.log('asdf')
    this.setState({ ActivityLog: tempArray });
  }
  public HoursStringToDecimal(hoursString) {
    const [hoursPart, minutesPart] = hoursString.split(":");
    return Number(hoursPart) + Number(minutesPart) / 60;
  }
  public DecimalHoursToString(hoursDecimal) {
    const numHours = Math.floor(hoursDecimal);
    const numMinutes = Math.round((hoursDecimal - numHours) * 60);
    return `${numHours < 10 ? "0" : ""}${numHours}:${numMinutes < 10 ? "0" : ""}${numMinutes}`;
  }
  public onInputchange = async (event) => {
    var eventvalue = event.target.value;
    var eventname = event.target.name;
    var data = this.state.SaveActivityLog;
    var PastTime;
    var ActivityLog = this.state.ActivityLog;
    var DailyFixHours = "08:00"
    PastTime = this.DecimalHoursToString(ActivityLog.reduce((acc, e) => (acc + this.HoursStringToDecimal(e.Time)), 0));
    if (eventname == "Hours") {
      var TotalTime = this.DecimalHoursToString(this.HoursStringToDecimal(PastTime) + this.HoursStringToDecimal(eventvalue));
      var ExtraTime = this.DecimalHoursToString(this.HoursStringToDecimal(PastTime) + this.HoursStringToDecimal(eventvalue) - this.HoursStringToDecimal(DailyFixHours));
      if (TotalTime > DailyFixHours) {
        await this.setState({ ExtraHourse: ExtraTime })
        await this.setState({ HoursAlert: true })
      } else {
        await this.setState({ HoursAlert: false })
      }
    }
    data[eventname] = eventvalue;
    await this.setState({ SaveActivityLog: data });
  }
  public onDecsChange = async (value) => {
    this.setState({ value });
    var data = this.state.SaveActivityLog;
    data["Description"] = value.toString('html');
    await this.setState({ SaveActivityLog: data });
    console.log(this.state.SaveActivityLog)
  };
  public SaveData() {
    if (this.validator.allValid()) {
      this.setState({ showPopup: false });
      this.setState({ showmainerror: false });
      this.setState({ showloader: true })
      var ListName = 'Activity Log';
      var today = new Date()
      var posturl = this.props.context.pageContext.web.absoluteUrl + `/_api/web/lists/getbytitle('` + ListName + `')/items`;
      var payload = JSON.stringify({
        "__metadata": { "type": "SP.Data.Activity_x0020_LogListItem" },
        'Title': this.state.SaveActivityLog['Task'],
        'Time': this.state.SaveActivityLog['Hours'],
        'Description': this.state.SaveActivityLog['Description'],
        'Date': today,
        'Caegory': '',
      });
      var option = {
        headers: {
          'IF-MATCH': '*',
          'Content-type': 'application/json;odata=verbose',
          "accept": "application/json;odata=verbose",
          "odata-version": "3.0",
          'X-HTTP-Method': 'ADD'
        },
        body: payload
      };
      return this.props.context.spHttpClient.post(posturl, SPHttpClient.configurations.v1, option).then((response: SPHttpClientResponse) => {
        this.setState({ showloader: false })
        this.setState({ SuccessPopup: true })
      });
    } else {
      this.validator.showMessages();
      this.setState({ showmainerror: true });
    }
  }
  public render(): React.ReactElement<IEmployeeTrackingProps> {
    var loginuser = this.props.context.pageContext.user.displayName
    const columns = [
      { name: 'Title', selector: 'Title', width: '250px', style: { "font-size": "15px !important" }, },
      {
        name: 'Description', selector: 'Description', cell: row => <div dangerouslySetInnerHTML={{ __html: row.Description }}></div>, width: '500px', style: { "font-size": "15px !important" },
      },
      { name: 'Category', selector: 'Category', sortable: true, width: '150px', style: { "font-size": "15px !important" }, },
      { name: 'Hours', selector: 'Time', sortable: true, width: '100px', style: { "font-size": "15px !important" }, },
    ];
    return (
      <div className={styles.employeeTracking}>
        <div className={styles.et_innerbox}>
          <div className={styles.welcomerow}>
            <span>Welcome <b>{loginuser}</b> to the Instranet.</span>
            <div className={styles.addbtn} onClick={() => this.openPopup()}>Add Time</div>
          </div>
          <div className={styles.table_box}>
            <DataTable columns={columns} data={this.state.ActivityLog} />
          </div>
        </div>
        <Modal isOpen={this.state.showPopup}>
          <div className={styles.modalPopup_header}>
            <h2>Add Time</h2>
            <div className={styles.closeBtnDiv} onClick={() => this.closePopup()}>
              <svg xmlns="http://www.w3.org/2000/svg" height="365pt" viewBox="0 0 365.71733 365" width="365pt"><g fill="#f44336"><path d="m356.339844 296.347656-286.613282-286.613281c-12.5-12.5-32.765624-12.5-45.246093 0l-15.105469 15.082031c-12.5 12.503906-12.5 32.769532 0 45.25l286.613281 286.613282c12.503907 12.5 32.769531 12.5 45.25 0l15.082031-15.082032c12.523438-12.480468 12.523438-32.75.019532-45.25zm0 0" /><path d="m295.988281 9.734375-286.613281 286.613281c-12.5 12.5-12.5 32.769532 0 45.25l15.082031 15.082032c12.503907 12.5 32.769531 12.5 45.25 0l286.632813-286.59375c12.503906-12.5 12.503906-32.765626 0-45.246094l-15.082032-15.082032c-12.5-12.523437-32.765624-12.523437-45.269531-.023437zm0 0" /></g></svg>
            </div>
          </div>
          <div className={styles.modalPopup}>
            {(this.state.HoursAlert == true) && (<div className={styles.hourserror}>
              <span>You have entered more than 08:00 hours today.</span>
              <span>Extra Time is<b>{this.state.ExtraHourse}</b></span>
            </div>)}
            {(this.validator.allValid() == false) && (
              (this.state.showmainerror) && (<div className={styles.showmainerror}>Please fill all the mandatory field.</div>)
            )}
            <ul className={styles.addtime}>
              <li className={styles.taskbox}>
                <label>Task</label>
                <input type="text" name="Task" onChange={this.onInputchange} onBlur={() => this.validator.showMessageFor('Task')} />
                {this.validator.message('Task', this.state.SaveActivityLog['Task'], 'required', { className: 'text-danger' })}
              </li>
              <li className={styles.hours}>
                <label>Hours</label>
                <input type="time" name="Hours" onChange={this.onInputchange} onBlur={() => this.validator.showMessageFor('Hours')} />
                {this.validator.message('Hours', this.state.SaveActivityLog['Hours'], 'required', { className: 'text-danger' })}
              </li>
              <li className={styles.dec}>
                <label>Description</label>
                <RichTextEditor value={this.state.value} onChange={this.onDecsChange} onBlur={() => this.validator.showMessageFor('Description')} />
                {this.validator.message('Description', this.state.SaveActivityLog['Description'], 'required', { className: 'text-danger' })}
              </li>
            </ul>
            <div className={styles.savebtn} onClick={() => this.SaveData()}>
              Save
            </div>
          </div>
        </Modal>
        {(this.state.showloader == true) && (<div className={styles.loader}><Loader type="Circles" color="#00BFFF" height={100} width={100} timeout={3000} /></div>)}
        <Modal isOpen={this.state.SuccessPopup}>
          <div className={styles.modalPopup_header}>
            <h2>Data added SuccessFully</h2>
            <div className={styles.closeBtnDiv} onClick={() => this.closeSuccessPopup()}>
              <svg xmlns="http://www.w3.org/2000/svg" height="365pt" viewBox="0 0 365.71733 365" width="365pt"><g fill="#f44336"><path d="m356.339844 296.347656-286.613282-286.613281c-12.5-12.5-32.765624-12.5-45.246093 0l-15.105469 15.082031c-12.5 12.503906-12.5 32.769532 0 45.25l286.613281 286.613282c12.503907 12.5 32.769531 12.5 45.25 0l15.082031-15.082032c12.523438-12.480468 12.523438-32.75.019532-45.25zm0 0" /><path d="m295.988281 9.734375-286.613281 286.613281c-12.5 12.5-12.5 32.769532 0 45.25l15.082031 15.082032c12.503907 12.5 32.769531 12.5 45.25 0l286.632813-286.59375c12.503906-12.5 12.503906-32.765626 0-45.246094l-15.082032-15.082032c-12.5-12.523437-32.765624-12.523437-45.269531-.023437zm0 0" /></g></svg>
            </div>
          </div>
          <div className={styles.modalPopup}>
            <div className={styles.mb_success_box}>
              <p>Your Entery have been Added SuccessFully.</p>
              {(this.state.ExtraHourse) > "00:00" && (<p>You have entered Extra Time - <b>{this.state.ExtraHourse}</b></p>)}
              <div onClick={() => this.closeSuccessPopup()} className={styles.popupbtn}>Ok</div>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}
