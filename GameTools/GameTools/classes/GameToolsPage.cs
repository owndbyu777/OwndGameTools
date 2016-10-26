using System;
using System.Web.UI;
using System.Web.UI.HtmlControls;

namespace GameTools.classes
{
    public class GameToolsPage : Page
    {
        virtual protected void Page_Load(object sender, EventArgs e)
        {
            HtmlGenericControl jsJquery = new HtmlGenericControl("script");
            jsJquery.Attributes.Add("type", "text/javascript");
            jsJquery.Attributes.Add("language", "javascript");
            jsJquery.Attributes.Add("src", "../content/js/jquery-3.1.1.js");

            Page.Header.Controls.AddAt(0, jsJquery);
        }
    }
}