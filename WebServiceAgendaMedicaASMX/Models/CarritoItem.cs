using System;

namespace WebServiceAgendaMedicaASMX.Models
{
    public class CarritoItem
    {
        public int CarritoID { get; set; }
        public int UsuarioID { get; set; }
        public int MedicamentoID { get; set; }
        public int Cantidad { get; set; }
        public DateTime FechaAgregado { get; set; }

        // Info del medicamento
        public string NombreMedicamento { get; set; }
        public string Presentacion { get; set; }
        public string Concentracion { get; set; }
    }
}