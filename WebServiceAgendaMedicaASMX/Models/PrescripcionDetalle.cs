using System;
using System.ComponentModel.DataAnnotations;

namespace WebServiceAgendaMedicaASMX.Models
{
    /// <summary>
    /// Modelo para la tabla PRESCRIPCION_DETALLE
    /// </summary>
    [Serializable]
    public class PrescripcionDetalle
    {
        public int DetalleID { get; set; }
        
        public int PrescripcionID { get; set; }
        
        public int MedicamentoID { get; set; }
        
        [StringLength(100)]
        public string Dosis { get; set; }
        
        [StringLength(100)]
        public string Frecuencia { get; set; }
        
        public int? DuracionDias { get; set; }
        
        [StringLength(500)]
        public string Instrucciones { get; set; }
        
        [StringLength(20)]
        public string Estado { get; set; } // Prescrito, Entregado, Cancelado
        
        public DateTime FechaCreacion { get; set; }
        
        public DateTime? FechaModificacion { get; set; }
        
        [StringLength(50)]
        public string CreadoPor { get; set; }
        
        [StringLength(50)]
        public string ModificadoPor { get; set; }
        
        // Propiedades de navegación
        public virtual Prescripcion Prescripcion { get; set; }
        public virtual Medicamento Medicamento { get; set; }
        
        public PrescripcionDetalle()
        {
            FechaCreacion = DateTime.Now;
            Estado = "Prescrito";
        }
        
        // Propiedades calculadas
        public bool EstaEntregado
        {
            get { return Estado == "Entregado"; }
        }
        
        public bool EstaCancelado
        {
            get { return Estado == "Cancelado"; }
        }
        
        public bool EstaPendiente
        {
            get { return Estado == "Prescrito"; }
        }
    }
}