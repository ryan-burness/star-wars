using BAL.Interface;
using Core;
using DAL.StarWarsProvider;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace BAL
{
    public class CharacterService(IMemoryCache cache, StarWarsRepository starWarsClient, ILogger<CharacterService> logger) : ICharacterService
    {
        public async Task<List<Character>?> GetCharactersAsync()
        {
            string cacheKey = "characterList";
            try
            {
                
                if (!cache.TryGetValue(cacheKey, out var cachedData))
                {

                    cachedData = await starWarsClient.GetCharactersAsync();

                    // Set cache options
                    var cacheEntryOptions = new MemoryCacheEntryOptions
                    {
                        //cache for 15m
                        SlidingExpiration = TimeSpan.FromMinutes(15)
                    };

                    if (cachedData != null)
                    {
                        // Save data in cache
                        cache.Set(cacheKey, cachedData, cacheEntryOptions);
                    }
                    
                }

                return (List<Character>?)cachedData;
            }
            catch (Exception ex)
            {

                logger.LogError(message: $"CharacterService Error: {ex.Message}");
            }

            return [];
        }
    }
}
