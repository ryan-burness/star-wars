
using System.Text.Json.Serialization;

namespace DAL.StarWarsProvider
{
    [JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Skip)]
    internal class Planets
    {
        public string? Name { get; set; }
        [JsonPropertyName("rotation_period")]
        public string? RotationPeriod { get; set; }
        [JsonPropertyName("orbital_period")]
        public string? OrbitalPeriod { get; set; }
        public string? Diameter { get; set; }
        public string? Climate { get; set; }
        public string? Gravity { get; set; }
        public string? Terrain { get; set; }
        [JsonPropertyName("surface_water")]
        public string? SurfaceWater { get; set; }
        public string? Population { get; set; }
        public List<string> Residents { get; set; } = [];
        [JsonPropertyName("fees_per_day")]
        public string? FeesPerDay { get; set; }
        public string? Image { get; set; }
        public string? Url { get; set; }
    }
}
