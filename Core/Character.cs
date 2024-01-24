using System.Text.Json;
using System.Text.Json.Serialization;

namespace Core
{
    public class Character
    {

        public string? Name { get; set; }
        public string? Image { get; set; }
        [JsonPropertyName("external_reference")]
        public string? ExternalReference { get; set; }

        public Planet? Homeworld { get; set; }

        public List<Family> Families { get; set; } = [];

    }
}
