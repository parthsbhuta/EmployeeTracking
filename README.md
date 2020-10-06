# Employee Tracking

## employee-tracking

This webpart track the Employee Work time and display employee own timesheet on web part to see the detail for current day.

### Setup the solution and WebPart

-   Go to Site Content and create a list and columns as follows
    -   Description – multiline with rich content.
	-   Date – Date and time Format
	-   Time
	-   Category
-   Clone the Solution repo
-   Run the below commands
    -   npm install
    -   gulp build
    -   gulp serve
-   Open the SharePoint Online site workbench (i.e., (SharePoint Site URL) +/_layouts/workbench.aspx)
-   Add Webpart: ParthSBhuta


### Build Package

-   gulp clean
-   gulp build
-   gulp bundle --ship
-   gulp package-solution --ship

### Features

-   Show Employee Current daye TimeSheet
-   Employee can add more Time logs

### Supports

-   IE11+, Chrome

### Solution

Solution|Author(s)
--------|---------
employee-tracking | Parth S Bhuta

### Version history

Version|Date|Comments
-------|----|--------
1.0.0.0|Oct 06, 2020|Initial release"# Employee-Tracking" 
