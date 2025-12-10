using System;
using System.ComponentModel.DataAnnotations;

namespace WebServiceAgendaMedicaASMX.Models
{
    /// <summary>
    /// Modelo para la tabla LOG_INTEGRACION
    /// </summary>
    [Serializable]
    public class LogIntegracion
    {
        public int LogID { get; set; }
        
        [StringLength(100)]
        public string Modulo { get; set; }
        
        [StringLength(50)]
        public string Operacion { get; set; }
        
        [StringLength(20)]
        public string Nivel { get; set; } // INFO, WARNING, ERROR
        
        [StringLength(500)]
        public string Mensaje { get; set; }
        
        [StringLength(1000)]
        public string Detalles { get; set; }
        
        [StringLength(50)]
        public string Usuario { get; set; }
        
        public DateTime FechaHora { get; set; }
        
        [StringLength(100)]
        public string DireccionIP { get; set; }
        
        [StringLength(500)]
        public string UserAgent { get; set; }
        
        [StringLength(100)]
        public string SessionID { get; set; }
        
        public LogIntegracion()
        {
            FechaHora = DateTime.Now;
            Nivel = "INFO";
        }
    }
}