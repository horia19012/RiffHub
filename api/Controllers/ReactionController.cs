using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using api.Models;
using api.Models.Enums;
using api.Services;
using System.Security.Claims;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReactionController : ControllerBase
    {
        private readonly IReactionService _service;

        public ReactionController(IReactionService service)
        {
            _service = service;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            var reactions = await _service.GetAllAsync();
            return Ok(reactions);
        }

        [HttpGet("{id:guid}")]
        [Authorize]
        public async Task<IActionResult> GetById(Guid id)
        {
            var reaction = await _service.GetByIdAsync(id);
            if (reaction == null) return NotFound();
            return Ok(reaction);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Add([FromBody] ReactionRequest request)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized("Invalid token.");

            var result = await _service.UpsertAsync(userId.Value, request.RiffId, request.Type);
            return Ok(result);
        }

        [HttpDelete("{id:guid}")]
        [Authorize]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _service.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }

        private Guid? GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)
                     ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
            return claim != null && Guid.TryParse(claim.Value, out var id) ? id : null;
        }
    }

    public record ReactionRequest(Guid RiffId, ReactionType Type);
}