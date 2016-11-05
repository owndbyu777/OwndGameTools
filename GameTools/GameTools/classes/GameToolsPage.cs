using System;
using System.Web.UI;
using System.Web.UI.HtmlControls;

namespace GameTools.classes
{
    public class GameToolsPage : Page
    {
        virtual protected void Page_Load(object sender, EventArgs e) {
            HtmlGenericControl cssJqueryUI = new HtmlGenericControl("link");
            cssJqueryUI.Attributes.Add("type", "text/css");
            cssJqueryUI.Attributes.Add("rel", "stylesheet");
            cssJqueryUI.Attributes.Add("href", "../content/css/jquery-ui.min.css");

            HtmlGenericControl jsJqueryUI = new HtmlGenericControl("script");
            jsJqueryUI.Attributes.Add("type", "text/javascript");
            jsJqueryUI.Attributes.Add("language", "javascript");
            jsJqueryUI.Attributes.Add("src", "../content/js/jquery-ui.min.js");

            HtmlGenericControl jsJquery = new HtmlGenericControl("script");
            jsJquery.Attributes.Add("type", "text/javascript");
            jsJquery.Attributes.Add("language", "javascript");
            jsJquery.Attributes.Add("src", "../content/js/jquery-3.1.1.js");

            HtmlGenericControl jsGlobals = new HtmlGenericControl("script");
            jsGlobals.Attributes.Add("type", "text/javascript");
            jsGlobals.Attributes.Add("language", "javascript");
            jsGlobals.Attributes.Add("src", "../content/js/globals.js");

            Page.Header.Controls.AddAt(0, cssJqueryUI);
            Page.Header.Controls.AddAt(0, jsJqueryUI);
            Page.Header.Controls.AddAt(0, jsJquery);
            Page.Header.Controls.AddAt(0, jsGlobals);
        }
    }
}