import { SPHttpClientResponse } from '@microsoft/sp-http';
export default class Utility {

    public getValues(siteurl: string): any {
        try {
            var url = siteurl + "/_api/contextinfo";
            return fetch(url, {
                method: "POST",
                credentials: 'same-origin',
                headers: { Accept: "application/json;odata=verbose" }
            }).then((response) => {
                var datum = response.json();
                return datum;
            });
        } catch (error) {
            console.log("getValues: " + error);
        }
    }
    public ensureUser(siteurl, url): any {
        return new Promise<number>((resolve, reject) => {
            this.getValues(siteurl).then((token) => {
                try {
                    fetch(url,
                        {
                            method: "POST",
                            credentials: 'same-origin',
                            headers: {
                                Accept: 'application/json',
                                "Content-Type": "application/json;odata=verbose",
                                "X-RequestDigest": token.d.GetContextWebInformation.FormDigestValue
                            }
                        }).then((response) => {
                            return response.json();
                        }).then((response) => {
                            resolve(response);
                        }).catch((error) => {
                            reject(error);
                        });
                }
                catch (e) {
                    console.log(e);
                    reject(e);
                }
            });
        });
    }
    public encodefilename(str) {
        //return escape(str.replace("'", "''"));
    }
    public getListItemEntityTypeName(siteAbsoluteUrl: string, listname: string): Promise<string> {
        var url = `${siteAbsoluteUrl}/_api/web/lists/getbytitle('${listname}')?$select=ListItemEntityTypeFullName`;
        return fetch(url, { credentials: 'same-origin', headers: { Accept: 'application/json;odata=nometadata' } }).then((response) => {
            return response.json();
        }, (errorFail) => {
            console.log("error");
        }).then((responseJSON) => {
            return responseJSON.ListItemEntityTypeFullName;
        }).catch((response: SPHttpClientResponse) => {
            return null;
        });
    }
    public getListItemById(siteAbsoluteUrl: string, listname: string, id: number): Promise<any> {
        var url = `${siteAbsoluteUrl}/_api/web/lists/getbytitle('${listname}')/items(${id})`;
        return fetch(url, { credentials: 'same-origin', headers: { Accept: 'application/json;odata=nometadata' } }).then((response) => {
            return response.json();
        }, (errorFail) => {
            console.log("error");
        }).then((responseJSON) => {
            return responseJSON;
        }).catch((response: SPHttpClientResponse) => {
            return null;
        });
    }
    public getListData(url: string): Promise<any> {
        return fetch(url, { credentials: 'same-origin', headers: { Accept: 'application/json;odata=nometadata' } }).then((response) => {
            return response.json();
        }, (errorFail) => {
            console.log("error");
        }).then((responseJSON) => {
            return responseJSON;
        }).catch((response: SPHttpClientResponse) => {
            return null;
        });
    }
    public insertdata(siteAbsoluteUrl: string, listname: string, requestdata, requestDigest): Promise<number> {
        var url = `${siteAbsoluteUrl}/_api/web/lists/getbytitle('${listname}')/items`;
        return new Promise<number>((resolve, reject) => {
            try {
                fetch(url,
                    {
                        method: "POST",
                        credentials: 'same-origin',
                        headers: {
                            Accept: 'application/json',
                            "Content-Type": "application/json;odata=verbose",
                            "X-RequestDigest": requestDigest
                        },
                        body: requestdata,
                    }).then((response) => {
                        return response.json();
                    }).then((response) => {
                        resolve(response.ID);
                    }).catch((error) => {
                        reject(error);
                    });
            }
            catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }
    public setStandardDateFormat(date: Date) {
        return (((date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '/' + (date.getDate() >= 10 ? date.getDate() : ('0' + date.getDate())) + '/' + date.getFullYear());
    }
    public updatedata(siteAbsoluteUrl: string, listname: string, requestdata, id: number, requestDigest) {
        var url = `${siteAbsoluteUrl}/_api/web/lists/getbytitle('${listname}')/items(${id})`;
        return new Promise<any>((resolve, reject) => {
            try {
                fetch(url,
                    {
                        method: "POST",
                        credentials: 'same-origin',
                        headers: {
                            Accept: 'application/json',
                            "Content-Type": "application/json;odata=verbose",
                            "X-RequestDigest": requestDigest,
                            'IF-MATCH': '*',
                            'X-HTTP-Method': 'MERGE'
                        },
                        body: requestdata,
                    })
                    .then((response) => {
                        resolve(response);
                    }).catch((error) => reject(error));
            }
            catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }
    public DeleteDocumentById(siteAbsoluteUrl: string, listname: string, id: number, requestDigest) {
        var url = `${siteAbsoluteUrl}/_api/web/lists/getbytitle('${listname}')/items(${id})`;
        return new Promise<any>((resolve, reject) => {
            try {
                fetch(url,
                    {
                        method: "POST",
                        credentials: 'same-origin',
                        headers: {
                            Accept: 'application/json',
                            "Content-Type": "application/json;odata=verbose",
                            "X-RequestDigest": requestDigest,
                            'IF-MATCH': '*',
                            'X-HTTP-Method': 'DELETE'
                        },
                    })
                    .then((response) => {
                        resolve(response);
                        return response;
                    }).catch((error) => reject(error));
            }
            catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }
}