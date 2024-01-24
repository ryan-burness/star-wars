using Core;
using DAL.Interface;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace DAL.StarWarsProvider
{
    public sealed class StarWarsRepository : IStarWarsProvider
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<StarWarsRepository> _logger;

        public StarWarsRepository(HttpClient httpClient, ILogger<StarWarsRepository> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task<List<Character>> GetCharactersAsync()
        {
            List<Character> characters = [];

            try
            {
                var people = await GetPeopleAsync();
                if (people == null) return characters;

                //Get all planets and species 
                //quicker to get all data than work out which planets and species to get data from
                //if data set was larger I first work out which records then make calls to get the record data
                var planets = await GetPlanetsAsync();
                var species = await GetSpeciesAsync();

                foreach (var person in people)
                {
                    //build Character using the Url 
                    if (person == null || string.IsNullOrEmpty(person.Url)) continue;

                    Character character = new Character()
                    {
                        Name = person.Name,
                        Image = person.Image,
                        ExternalReference = Guid.NewGuid().ToString(),
                    };
                    var homeworld = person.Homeworld ?? "";
                    var qHomeWorld = planets?.Where(x => x.Url?.StartsWith(homeworld) == true).FirstOrDefault();
                    if (qHomeWorld != default)
                    {
                        character.Homeworld = new Planet()
                        {
                            FeesPerDay = (float)(string.IsNullOrEmpty(qHomeWorld.FeesPerDay) ? 0 : float.Parse(qHomeWorld.FeesPerDay)),
                            Image = qHomeWorld.Image,
                            Name = qHomeWorld.Name
                        };
                    }
                    IEnumerable<Species>? qSpecies = species?.Where(x => x.People.Contains(person.Url));
                    if (qSpecies?.Any() == true)
                    {

                        character.Families = qSpecies.Where(x => x.People.Contains(person.Url))
                            .Select(x => new Family()
                            {
                                Name = x.Name,
                                Classification = x.Classification ?? "n/a",
                                Designation = x.Designation ?? "n/a"
                            }).ToList();
                    }

                    characters.Add(character);
                }

            }
            catch (Exception ex)
            {
                _logger.LogError($"Error StarWarsRepository GetCharactersAsync - {ex.Message}");
            }

            return characters;
        }
        private async Task<List<People>?> GetPeopleAsync() => await GetAsync<People>("people");
        private async Task<List<Planets>?> GetPlanetsAsync() => await GetAsync<Planets>("planet");
        private async Task<List<Species>?> GetSpeciesAsync() => await GetAsync<Species>("species");

        /// <summary>
        /// Throws exception on bad response
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="endpoint"></param>
        /// <returns></returns>
        private async Task<List<T>?> GetAsync<T>(string endpoint = "people")
        {

            var httpResponse = await _httpClient.GetAsync(endpoint);

            httpResponse.EnsureSuccessStatusCode();

            using var contentStream = await httpResponse.Content.ReadAsStreamAsync();

            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
            };
            ApiResponseWrapper<T>? responseWrapper = await JsonSerializer.DeserializeAsync<ApiResponseWrapper<T>>(contentStream, options);

            List<T> items = responseWrapper?.Results ?? [];

            return items;
        }
    }
}
