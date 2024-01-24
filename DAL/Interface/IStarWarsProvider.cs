using Core;

namespace DAL.Interface
{
    public interface IStarWarsProvider
    {
        Task<List<Character>> GetCharactersAsync();
    }
}
