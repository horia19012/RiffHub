using Microsoft.AspNetCore.Mvc;
using api.Models;
using api.Services;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RiffController : ControllerBase
    {
        private readonly IRiffService _service;

        public RiffController(IRiffService service)
        {
            _service = service;
        }

        // GET: api/riff
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var riffs = await _service.GetAllAsync();
            return Ok(riffs);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var riff = await _service.GetByIdAsync(id);
            if (riff == null) return NotFound();
            return Ok(riff);
        }

        [HttpPost]
        public async Task<IActionResult> Add(Riff riff)
        {
            var added = await _service.AddAsync(riff);
            return CreatedAtAction(nameof(GetById), new { id = added.Id }, added);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, Riff riff)
        {
            var updated = await _service.UpdateAsync(id, riff);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _service.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
