using System;
using System.ComponentModel.DataAnnotations;

namespace WebServiceAgendaMedicaASMX.Models
{
    /// <summary>
    /// Modelo para la tabla PRESCRIPCION
    /// </summary>
    [Serializable]
    public class Prescripcion
    {
        public int PrescripcionID { get; set; }
        
        public int? CitaID { get; set; }
        
        public int? DoctorID { get; set; }
        
        public int? PacienteID { get; set; }
        
        [StringLength(200)]
        public string Diagnostico { get; set; }
        
        [StringLength(500)]
        public string Observaciones { get; set; }
        
        public DateTime FechaPrescripcion { get; set; }
        
        [StringLength(20)]
        public string Estado { get; set; } // Activa, Completada, Cancelada
        
        public DateTime FechaCreacion { get; set; }
        
        public DateTime? FechaModificacion { get; set; }
        
        [StringLength(50)]
        public string CreadoPor { get; set; }
        
        [StringLength(50)]
        public string ModificadoPor { get; set; }
        
        // Propiedades de navegación
        public virtual System.Collections.Generic.List<PrescripcionDetalle> Detalles { get; set; }
        
        public Prescripcion()
        {
            FechaCreacion = DateTime.Now;
            FechaPrescripcion = DateTime.Now;
            Estado = "Activa";
            Detalles = new System.Collections.Generic.List<PrescripcionDetalle>();
        }
        
        // Propiedades calculadas
        public int TotalMedicamentos
        {
            get { return Detalles?.Count ?? 0; }
        }
        
        public bool EstaCompleta
        {
            get { return Estado == "Completada"; }
        }
        
        public bool EstaActiva
        {
            get { return Estado == "Activa"; }
        }
    }
}