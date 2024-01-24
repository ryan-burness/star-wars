using System.Text.Json.Serialization;

namespace DAL.StarWarsProvider
{
    internal class ApiResponseWrapper<T>
    {
        [property: JsonPropertyName("results")]
        public List<T> Results { get; set; } = [];
    }
}
