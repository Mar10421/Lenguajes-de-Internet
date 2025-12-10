using System;
using System.Collections.Generic;
using System.Data;
using System.Web.Script.Services;
using System.Web.Services;
using WebServiceAgendaMedicaASMX.Models;
using WebServiceAgendaMedicaASMX.Utils;

namespace WebServiceAgendaMedicaASMX.Services
{
    [WebService(Namespace = "http://tempuri.org/")]
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
    [ScriptService]
    public class InventarioService : WebService
    {
        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public List<Medicamento> ObtenerInventario()
        {
            string query = "SELECT * FROM MEDICAMENTO ORDER BY Nombre";
            DataTable dt = DBConnection.ExecuteQuery(query);
            List<Medicamento> lista = new List<Medicamento>();
            foreach (DataRow row in dt.Rows)
            {
                lista.Add(MapRowToInventario(row));
            }
            return lista;
        }

        private Medicamento MapRowToInventario(DataRow row)
        {
            return new Medicamento
            {
                MedicamentoID = Convert.ToInt32(row["MedicamentoID"]),
                Codigo = row["Codigo"]?.ToString(),
                Nombre = row["Nombre"].ToString(),
                NombreGenerico = row["NombreGenerico"]?.ToString(),
                Presentacion = row["Presentacion"]?.ToString(),
                Concentracion = row["Concentracion"]?.ToString(),
                Laboratorio = row["Laboratorio"]?.ToString(),
                RequiereReceta = Convert.ToBoolean(row["RequiereReceta"]),
                Estado = row["Estado"]?.ToString(),
                FechaRegistro = Convert.ToDateTime(row["FechaRegistro"])
            };
        }
    }
}