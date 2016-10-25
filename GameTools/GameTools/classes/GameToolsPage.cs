using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GameTools.classes
{
    public class GameToolsPage : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            System.Web.UI.HtmlControls.HtmlControl jsJquery;// = System.Web.UI.HtmlControls.HtmlControl("script");
            jsJquery.Attributes.Add("type", "text/javascript");
            jsJquery.Attributes.Add("language", "javascript");
            jsJquery.Attributes.Add("src", "../content/js/jquery-3.1.1.js");

            Header.Controls.AddAt(0, jsJquery)
        }
    }
}