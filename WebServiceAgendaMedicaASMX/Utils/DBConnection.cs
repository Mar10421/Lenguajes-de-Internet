using System;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;

namespace WebServiceAgendaMedicaASMX.Utils
{
    /// <summary>
    /// Clase para manejar la conexión a la base de datos SQL Server
    /// </summary>
    public static class DBConnection
    {
        private static readonly string ConnectionString = LoadConnectionString();

        private static string LoadConnectionString()
        {
            var entry = ConfigurationManager.ConnectionStrings["DefaultConnection"];
            if (entry == null || string.IsNullOrWhiteSpace(entry.ConnectionString))
                throw new ConfigurationErrorsException("Falta 'DefaultConnection' en Web.config.");
            return entry.ConnectionString;
        }
        
        /// <summary>
        /// Obtiene una nueva conexión a la base de datos
        /// </summary>
        /// <returns>SqlConnection configurada</returns>
        public static SqlConnection GetConnection()
        {
            var connection = new SqlConnection(ConnectionString);
            return connection;
        }
        
        /// <summary>
        /// Ejecuta una consulta y retorna un DataTable
        /// </summary>
        /// <param name="query">Consulta SQL</param>
        /// <param name="parameters">Parámetros opcionales</param>
        /// <returns>DataTable con los resultados</returns>
        public static DataTable ExecuteQuery(string query, params SqlParameter[] parameters)
        {
            using (var connection = GetConnection())
            {
                using (var command = new SqlCommand(query, connection))
                {
                    if (parameters != null)
                    {
                        command.Parameters.AddRange(parameters);
                    }
                    
                    using (var adapter = new SqlDataAdapter(command))
                    {
                        var dataTable = new DataTable();
                        adapter.Fill(dataTable);
                        return dataTable;
                    }
                }
            }
        }
        
        /// <summary>
        /// Ejecuta un comando que no retorna datos (INSERT, UPDATE, DELETE)
        /// </summary>
        /// <param name="query">Comando SQL</param>
        /// <param name="parameters">Parámetros opcionales</param>
        /// <returns>Número de filas afectadas</returns>
        public static int ExecuteNonQuery(string query, params SqlParameter[] parameters)
        {
            using (var connection = GetConnection())
            {
                connection.Open();
                using (var command = new SqlCommand(query, connection))
                {
                    if (parameters != null)
                    {
                        command.Parameters.AddRange(parameters);
                    }
                    
                    return command.ExecuteNonQuery();
                }
            }
        }
        
        /// <summary>
        /// Ejecuta una consulta que retorna un valor escalar
        /// </summary>
        /// <param name="query">Consulta SQL</param>
        /// <param name="parameters">Parámetros opcionales</param>
        /// <returns>Valor escalar</returns>
        public static object ExecuteScalar(string query, params SqlParameter[] parameters)
        {
            using (var connection = GetConnection())
            {
                connection.Open();
                using (var command = new SqlCommand(query, connection))
                {
                    if (parameters != null)
                    {
                        command.Parameters.AddRange(parameters);
                    }
                    
                    return command.ExecuteScalar();
                }
            }
        }
        
        /// <summary>
        /// Prueba la conexión a la base de datos
        /// </summary>
        /// <returns>True si la conexión es exitosa</returns>
        public static bool TestConnection()
        {
            try
            {
                using (var connection = GetConnection())
                {
                    connection.Open();
                    return true;
                }
            }
            catch (Exception)
            {
                return false;
            }
        }
        
        /// <summary>
        /// Obtiene la cadena de conexión sin la contraseña para logging
        /// </summary>
        /// <returns>Cadena de conexión segura</returns>
        public static string GetSafeConnectionString()
        {
            var builder = new SqlConnectionStringBuilder(ConnectionString);
            builder.Password = "***PASSWORD***";
            return builder.ConnectionString;
        }
    }
}