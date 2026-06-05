using FSH.Modules.Organization.Contracts.Dtos;
using FSH.Modules.Organization.Data;
using Microsoft.EntityFrameworkCore;

namespace FSH.Modules.Organization.Services;

internal sealed class UserDepartmentService : IUserDepartmentService
{
    private readonly OrganizationDbContext _dbContext;

    public UserDepartmentService(OrganizationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<UserDepartmentDto>> GetAssignmentsAsync(string userId)
    {
        return await _dbContext.UserDepartmentAssignments
            .AsNoTracking()
            .Where(ud => ud.UserId == userId)
            .Select(ud => new UserDepartmentDto(
                ud.UserId,
                ud.DepartmentId,
                _dbContext.Departments
                    .Where(d => d.Id == ud.DepartmentId)
                    .Select(d => d.Name)
                    .FirstOrDefault() ?? string.Empty,
                ud.PositionId,
                ud.PositionId != null
                    ? _dbContext.Positions
                        .Where(p => p.Id == ud.PositionId)
                        .Select(p => p.Name)
                        .FirstOrDefault()
                    : null,
                ud.IsPrimary,
                ud.AssignedAtUtc))
            .ToListAsync();
    }
}
