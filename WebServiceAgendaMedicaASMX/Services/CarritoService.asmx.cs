using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Web.Services;
using System.Web.Script.Services;
using WebServiceAgendaMedicaASMX.Models;
using WebServiceAgendaMedicaASMX.Utils;

namespace WebServiceAgendaMedicaASMX.Services
{
    [WebService(Namespace = "http://tempuri.org/")]
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
    [System.ComponentModel.ToolboxItem(false)]
    [ScriptService]
    public class CarritoService : System.Web.Services.WebService
    {
        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public List<CarritoItem> ObtenerCarrito(int usuarioID)
        {
            var items = new List<CarritoItem>();
            const string query = @"
                SELECT c.CarritoID, c.UsuarioID, c.MedicamentoID, c.Cantidad, c.FechaAgregado,
                       m.Nombre as NombreMedicamento, m.Presentacion, m.Concentracion
                FROM CARRITO c
                INNER JOIN MEDICAMENTO m ON c.MedicamentoID = m.MedicamentoID
                WHERE c.UsuarioID = @UsuarioID
                ORDER BY c.FechaAgregado DESC";

            var param = new SqlParameter("@UsuarioID", usuarioID);
            var dt = DBConnection.ExecuteQuery(query, param);

            foreach (DataRow row in dt.Rows)
            {
                items.Add(new CarritoItem
                {
                    CarritoID = Convert.ToInt32(row["CarritoID"]),
                    UsuarioID = Convert.ToInt32(row["UsuarioID"]),
                    MedicamentoID = Convert.ToInt32(row["MedicamentoID"]),
                    Cantidad = Convert.ToInt32(row["Cantidad"]),
                    FechaAgregado = Convert.ToDateTime(row["FechaAgregado"]),
                    NombreMedicamento = row["NombreMedicamento"].ToString(),
                    Presentacion = row["Presentacion"]?.ToString(),
                    Concentracion = row["Concentracion"]?.ToString()
                });
            }
            return items;
        }

        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public bool AgregarAlCarrito(int usuarioID, int medicamentoID, int cantidad)
        {
            // Verificar si ya existe
            const string checkQuery = "SELECT COUNT(*) FROM CARRITO WHERE UsuarioID = @UsuarioID AND MedicamentoID = @MedicamentoID";
            var checkParams = new[] {
                new SqlParameter("@UsuarioID", usuarioID),
                new SqlParameter("@MedicamentoID", medicamentoID)
            };
            var result = DBConnection.ExecuteQuery(checkQuery, checkParams);
            int count = Convert.ToInt32(result.Rows[0][0]);

            if (count > 0)
            {
                // Actualizar cantidad
                const string updateQuery = "UPDATE CARRITO SET Cantidad = Cantidad + @Cantidad WHERE UsuarioID = @UsuarioID AND MedicamentoID = @MedicamentoID";
                var updateParams = new[] {
                    new SqlParameter("@Cantidad", cantidad),
                    new SqlParameter("@UsuarioID", usuarioID),
                    new SqlParameter("@MedicamentoID", medicamentoID)
                };
                return DBConnection.ExecuteNonQuery(updateQuery, updateParams) > 0;
            }
            else
            {
                // Insertar nuevo
                const string insertQuery = "INSERT INTO CARRITO (UsuarioID, MedicamentoID, Cantidad) VALUES (@UsuarioID, @MedicamentoID, @Cantidad)";
                var insertParams = new[] {
                    new SqlParameter("@UsuarioID", usuarioID),
                    new SqlParameter("@MedicamentoID", medicamentoID),
                    new SqlParameter("@Cantidad", cantidad)
                };
                return DBConnection.ExecuteNonQuery(insertQuery, insertParams) > 0;
            }
        }

        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public bool QuitarDelCarrito(int carritoID)
        {
            const string query = "DELETE FROM CARRITO WHERE CarritoID = @CarritoID";
            var param = new SqlParameter("@CarritoID", carritoID);
            return DBConnection.ExecuteNonQuery(query, param) > 0;
        }
        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public bool ModificarCantidad(int carritoID, int nuevaCantidad)
        {
            if (nuevaCantidad < 1) return false;

            const string query = "UPDATE CARRITO SET Cantidad = @Cantidad WHERE CarritoID = @CarritoID";
            var parametros = new[] {
        new SqlParameter("@Cantidad", nuevaCantidad),
        new SqlParameter("@CarritoID", carritoID)
    };
            return DBConnection.ExecuteNonQuery(query, parametros) > 0;
        }

        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public bool LimpiarCarrito(int usuarioID)
        {
            const string query = "DELETE FROM CARRITO WHERE UsuarioID = @UsuarioID";
            var param = new SqlParameter("@UsuarioID", usuarioID);
            return DBConnection.ExecuteNonQuery(query, param) > 0;
        }
    }
}