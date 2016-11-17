using System;
using System.Collections.Generic;
using System.Web.Script.Serialization;
using System.Xml;
using System.IO;

namespace GameTools.XMLCompiler
{
    public partial class XMLCompiler : classes.GameToolsPage {

        protected override void Page_Load(object sender, EventArgs e) {
            base.Page_Load(sender, e);
            AjaxPro.Utility.RegisterTypeForAjax(typeof(XMLCompiler));
        }

        [AjaxPro.AjaxMethod]
        public string saveXML(string jsonDetails)
        {
            try {
                JavaScriptSerializer s = new JavaScriptSerializer();
                Dictionary<string, object> dic = s.Deserialize<Dictionary<string, object>>(jsonDetails);

                XmlDocument doc = new XmlDocument();
                XmlElement root = (XmlElement)doc.AppendChild(doc.CreateElement("Container"));
                XmlElement array = (XmlElement)root.AppendChild(doc.CreateElement("Array"));

                string[] nameArr = { "name", "cost", "description", "damage", "type" };
                for (uint rowNum = 0; rowNum < 5; rowNum++) {
                    XmlElement row = (XmlElement)array.AppendChild(doc.CreateElement("Row" + rowNum.ToString()));

                    for (uint colNum = 0; colNum < nameArr.Length; colNum++) {
                        XmlElement col = (XmlElement)row.AppendChild(doc.CreateElement(nameArr[colNum]));
                        col.InnerXml = rowNum.ToString();
                    }
                }

                string path = @"c:\xmlfile.xml";
                File.WriteAllText(path, doc.OuterXml);

                if (dic.ContainsKey("success")) {
                    return "{ \"success\": true }";
                } else {
                    return "{ \"success\": false }";
                }
            } catch (Exception e) {
                return "{\"success\": false, \"error\": \"" + e.Message + "\"}";
            }
        }

        [AjaxPro.AjaxMethod(AjaxPro.HttpSessionStateRequirement.ReadWrite)]
        public string loadXML() {
            return "{ \"success\": true }";
        }

    }
}