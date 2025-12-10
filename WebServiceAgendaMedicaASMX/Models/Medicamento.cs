using System;

namespace WebServiceAgendaMedicaASMX.Models
{
    public class Medicamento
    {
        public int MedicamentoID { get; set; }
        public string Codigo { get; set; }
        public string Nombre { get; set; }
        public string NombreGenerico { get; set; }
        public string Presentacion { get; set; }
        public string Concentracion { get; set; }
        public string Laboratorio { get; set; }
        public bool RequiereReceta { get; set; }
        public string Estado { get; set; }
        public DateTime FechaRegistro { get; set; }
    }
}