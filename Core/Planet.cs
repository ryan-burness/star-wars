using System.Text.Json.Serialization;

namespace Core
{
    public class Planet
    {
        public string? Name { get; set; }
        [JsonPropertyName("fees_per_day")]
        public float FeesPerDay { get; set; }
        public string? Image { get; set; }
    }
}