using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Web.Script.Services;
using System.Web.Services;
using WebServiceAgendaMedicaASMX.Models;
using WebServiceAgendaMedicaASMX.Utils;

namespace WebServiceAgendaMedicaASMX.Services
{
    [WebService(Namespace = "http://tempuri.org/")]
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
    [ScriptService]
    public class MedicamentosService : WebService
    {
        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public List<Medicamento> ObtenerMedicamentos()
        {
            string query = "SELECT * FROM MEDICAMENTO WHERE Estado = 'ACTIVO'";
            DataTable dt = DBConnection.ExecuteQuery(query);
            List<Medicamento> lista = new List<Medicamento>();
            foreach (DataRow row in dt.Rows)
            {
                lista.Add(MapRowToMedicamento(row));
            }
            return lista;
        }

        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public List<Medicamento> BuscarMedicamentos(string termino)
        {
            string query = "SELECT * FROM MEDICAMENTO WHERE Estado = 'ACTIVO' AND (Nombre LIKE @Termino OR NombreGenerico LIKE @Termino)";
            DataTable dt = DBConnection.ExecuteQuery(query, new SqlParameter("@Termino", "%" + termino + "%"));
            List<Medicamento> lista = new List<Medicamento>();
            foreach (DataRow row in dt.Rows)
            {
                lista.Add(MapRowToMedicamento(row));
            }
            return lista;
        }

        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public Medicamento ObtenerMedicamentoPorId(int id)
        {
            string query = "SELECT * FROM MEDICAMENTO WHERE MedicamentoID = @Id";
            DataTable dt = DBConnection.ExecuteQuery(query, new SqlParameter("@Id", id));
            if (dt.Rows.Count > 0)
                return MapRowToMedicamento(dt.Rows[0]);
            return null;
        }

        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public bool AgregarMedicamento(string codigo, string nombre, string nombreGenerico,
            string laboratorio, string presentacion, string concentracion, int requiereReceta)
        {
            string query = @"INSERT INTO MEDICAMENTO (Codigo, Nombre, NombreGenerico, 
                Presentacion, Concentracion, Laboratorio, RequiereReceta, Estado, FechaRegistro) 
                VALUES (@Codigo, @Nombre, @NombreGenerico, @Presentacion, @Concentracion, 
                @Laboratorio, @RequiereReceta, 'ACTIVO', GETDATE())";

            int rows = DBConnection.ExecuteNonQuery(query,
                new SqlParameter("@Codigo", codigo ?? ""),
                new SqlParameter("@Nombre", nombre),
                new SqlParameter("@NombreGenerico", nombreGenerico ?? ""),
                new SqlParameter("@Presentacion", presentacion ?? ""),
                new SqlParameter("@Concentracion", concentracion ?? ""),
                new SqlParameter("@Laboratorio", laboratorio ?? ""),
                new SqlParameter("@RequiereReceta", requiereReceta == 1));
            return rows > 0;
        }

        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public bool ActualizarMedicamento(int medicamentoID, string codigo, string nombre,
            string nombreGenerico, string laboratorio, string presentacion, string concentracion, int requiereReceta)
        {
            string query = @"UPDATE MEDICAMENTO SET Codigo = @Codigo, Nombre = @Nombre, 
                NombreGenerico = @NombreGenerico, Presentacion = @Presentacion, 
                Concentracion = @Concentracion, Laboratorio = @Laboratorio, 
                RequiereReceta = @RequiereReceta WHERE MedicamentoID = @Id";

            int rows = DBConnection.ExecuteNonQuery(query,
                new SqlParameter("@Id", medicamentoID),
                new SqlParameter("@Codigo", codigo ?? ""),
                new SqlParameter("@Nombre", nombre),
                new SqlParameter("@NombreGenerico", nombreGenerico ?? ""),
                new SqlParameter("@Presentacion", presentacion ?? ""),
                new SqlParameter("@Concentracion", concentracion ?? ""),
                new SqlParameter("@Laboratorio", laboratorio ?? ""),
                new SqlParameter("@RequiereReceta", requiereReceta == 1));
            return rows > 0;
        }

        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public bool EliminarMedicamento(int medicamentoID)
        {
            string query = "UPDATE MEDICAMENTO SET Estado = 'INACTIVO' WHERE MedicamentoID = @Id";
            int rows = DBConnection.ExecuteNonQuery(query, new SqlParameter("@Id", medicamentoID));
            return rows > 0;
        }

        private Medicamento MapRowToMedicamento(DataRow row)
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