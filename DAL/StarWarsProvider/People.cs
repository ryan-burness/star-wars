using System.Text.Json.Serialization;

namespace DAL.StarWarsProvider
{
    //allow for partial property mapping
    [JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Skip)]
    internal class People
    {
        public string? Name { get; set; }
        public string? Height { get; set; }
        public string? Mass { get; set; }
        [JsonPropertyName("hair_color")]
        public string? HairColor { get; set; }
        [JsonPropertyName("skin_color")]
        public string? SkinColor { get; set; }
        [JsonPropertyName("eye_color")]
        public string? EyeColor { get; set; }
        [JsonPropertyName("birth_year")]
        public string? BirthYear { get; set; }
        public string? Gender { get; set; }
        public string? Homeworld { get; set; }
        public string? Image { get; set; }
        public List<string> Species { get; set; } = [];
        public string? Url { get; set; }
    }

}
