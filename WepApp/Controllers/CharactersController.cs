using BAL.Interface;
using Microsoft.AspNetCore.Mvc;
using WepApp.Controllers;

namespace WebApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CharactersController : ControllerBase
    {
        private readonly ILogger<HomeController> _logger;
        private readonly ICharacterService _starWarsService;

        public CharactersController(ILogger<HomeController> logger, ICharacterService starWarsService)
        {
            _logger = logger;
            _starWarsService = starWarsService;
        }

        [HttpGet]
        [Route("")]
        [Produces("application/json")]
        public async Task<IActionResult> Characters()
        {
            var characters = await _starWarsService.GetCharactersAsync();
            return Ok(new
            {
                Results = characters
            });
        }
    }
}
