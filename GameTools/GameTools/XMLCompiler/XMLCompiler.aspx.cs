using System;
using System.Collections;
using System.Collections.Generic;
using System.Web.Script.Serialization;
using System.Xml.Linq;
using System.Text;

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

                XDocument xmlDoc = new XDocument();
                XElement xmlRoot = new XElement("Container");
                XElement xmlArray = new XElement("Array");

                ArrayList protoCols = (ArrayList)dic["protoCols"];
                ArrayList protoColNames = new ArrayList();
                foreach (string name in protoCols) {
                    protoColNames.Add(name);
                }

                ArrayList rows = (ArrayList)dic["rows"];
                foreach (Dictionary<string, object> row in rows) {
                    string rowId = "i" + rows.IndexOf(row).ToString();
                    XElement xmlRow = new XElement(rowId);

                    ArrayList cols = (ArrayList)row["cols"];
                    foreach (string col in cols) {
                        XElement xmlCol = new XElement((string)protoColNames[cols.IndexOf(col)]);
                        xmlCol.SetValue(col);
                        xmlRow.Add(xmlCol);
                    }

                    xmlArray.Add(xmlRow);
                }

                xmlRoot.Add(xmlArray);
                xmlDoc.Add(xmlRoot);

                //XmlDocument xmlDoc = new XmlDocument();
                //XmlElement xmlRoot = (XmlElement)xmlDoc.AppendChild(xmlDoc.CreateElement("Container"));
                //XmlElement xmlArray = (XmlElement)xmlRoot.AppendChild(xmlDoc.CreateElement("Array"));

                ////ArrayList colNames;

                //ArrayList protoCols = (ArrayList)dic["protoCols"];
                //ArrayList protoColNames = new ArrayList();
                //foreach (string name in protoCols) {
                //    protoColNames.Add(name);
                //}

                //ArrayList rows = (ArrayList)dic["rows"];
                //foreach (Dictionary<string, object> row in rows) {
                //    XmlElement xmlRow = (XmlElement)xmlArray.AppendChild(xmlDoc.CreateElement(rows.IndexOf(row).ToString()));

                //    ArrayList cols = (ArrayList)row["cols"];
                //    foreach (string col in cols) {
                //        XmlElement xmlCol = (XmlElement)xmlRow.AppendChild(xmlDoc.CreateElement((string)protoColNames[cols.IndexOf(col)]));
                //        xmlCol.InnerXml = col;
                //    }
                //}

                //string[] nameArr = { "name", "cost", "description", "damage", "type" };
                //for (uint rowNum = 0; rowNum < 5; rowNum++) {
                //    XmlElement row = (XmlElement)array.AppendChild(doc.CreateElement("Row" + rowNum.ToString()));

                //    for (uint colNum = 0; colNum < nameArr.Length; colNum++) {
                //        XmlElement col = (XmlElement)row.AppendChild(doc.CreateElement(nameArr[colNum]));
                //        col.InnerXml = rowNum.ToString();
                //    }
                //}

                string path = @"";
                if ((string)dic[@"filePath"] != @"") {
                    path = (string)dic[@"filePath"];
                } else {
                    path = @"C:\\Users\\David\\Desktop\\Games\\xmlfile.xml";
                }
                xmlDoc.Save(path);
                //File.WriteAllText(path, xmlDoc.OuterXml);
                
                return "{ \"success\": true }";
            } catch (Exception ex) {
                return "{\"success\": false, \"error\": \"" + ex.Message + "\"}";
            }
        }

        [AjaxPro.AjaxMethod]
        public string loadXML(string jsonDetails) {
            try {
                JavaScriptSerializer s = new JavaScriptSerializer();
                Dictionary<string, object> dic = s.Deserialize<Dictionary<string, object>>(jsonDetails);

                StringBuilder sb = new StringBuilder();

                string path = @"";
                if ((string)dic[@"filePath"] != @"") {
                    path = (string)dic[@"filePath"];
                } else {
                    path = @"C:\\Users\\David\\Desktop\\Games\\xmlfile.xml";
                }
                XDocument xmlDoc = XDocument.Load(path);

                foreach (XElement cont in xmlDoc.Descendants("Container")) {
                    foreach (XElement arr in cont.Descendants("Array")) {
                        sb.Append("\"arr\": [");
                        bool first = true;
                        foreach (XElement row in arr.Elements()) {
                            if (first) {
                                first = false;
                            } else {
                                sb.Append(", ");
                            }
                            sb.Append("{");

                            bool firstCol = true;
                            foreach (XElement col in row.Descendants()) {
                                if (firstCol) {
                                    firstCol = false;
                                } else {
                                    sb.Append(", ");
                                }
                                sb.Append("\"").Append(col.Name).Append("\": \"").Append(col.Value).Append("\"");
                            }

                            sb.Append("}");
                        }
                        sb.Append("]");
                    }
                }


                return "{ \"success\": true, " + sb.ToString() + " }";
            } catch (Exception ex) {
                return "{\"success\": false, \"error\": \"" + ex.Message + "\"}";
            }
        }

    }
}