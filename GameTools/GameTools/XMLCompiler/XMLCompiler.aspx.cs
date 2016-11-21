using System;
using System.Collections;
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

                XmlDocument xmlDoc = new XmlDocument();
                XmlElement xmlRoot = (XmlElement)xmlDoc.AppendChild(xmlDoc.CreateElement("Container"));
                XmlElement xmlArray = (XmlElement)xmlRoot.AppendChild(xmlDoc.CreateElement("Array"));

                //ArrayList colNames;

                ArrayList protoCols = (ArrayList)dic["protoCols"];
                ArrayList protoColNames = new ArrayList();
                foreach (string name in protoCols) {
                    protoColNames.Add(name);
                }

                ArrayList rows = (ArrayList)dic["rows"];
                foreach (Dictionary<string, object> row in rows) {
                    XmlElement xmlRow = (XmlElement)xmlArray.AppendChild(xmlDoc.CreateElement(rows.IndexOf(row).ToString()));

                    ArrayList cols = (ArrayList)row["cols"];
                    foreach (string col in cols) {
                        XmlElement xmlCol = (XmlElement)xmlRow.AppendChild(xmlDoc.CreateElement((string)protoColNames[cols.IndexOf(col)]));
                        xmlCol.InnerXml = col;
                    }
                }

                //string[] nameArr = { "name", "cost", "description", "damage", "type" };
                //for (uint rowNum = 0; rowNum < 5; rowNum++) {
                //    XmlElement row = (XmlElement)array.AppendChild(doc.CreateElement("Row" + rowNum.ToString()));

                //    for (uint colNum = 0; colNum < nameArr.Length; colNum++) {
                //        XmlElement col = (XmlElement)row.AppendChild(doc.CreateElement(nameArr[colNum]));
                //        col.InnerXml = rowNum.ToString();
                //    }
                //}

                string path = @"c:\xmlfile.xml";
                File.WriteAllText(path, xmlDoc.OuterXml);
                
                return "{ \"success\": true }";
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