using FSH.Modules.Organization.Contracts.Dtos;
using FSH.Modules.Organization.Contracts.v1.Departments;
using FSH.Modules.Organization.Data;
using Mediator;
using Microsoft.EntityFrameworkCore;

namespace FSH.Modules.Organization.Features.v1.Departments.GetDepartmentTree;

public sealed class GetDepartmentTreeQueryHandler(OrganizationDbContext dbContext)
    : IQueryHandler<GetDepartmentTreeQuery, List<DepartmentDto>>
{
    public async ValueTask<List<DepartmentDto>> Handle(GetDepartmentTreeQuery query, CancellationToken cancellationToken)
    {
        var departments = await dbContext.Departments
            .AsNoTracking()
            .OrderBy(d => d.SortOrder)
            .ThenBy(d => d.Name)
            .ToListAsync(cancellationToken).ConfigureAwait(false);

        var memberCounts = await dbContext.UserDepartmentAssignments
            .AsNoTracking()
            .GroupBy(ud => ud.DepartmentId)
            .Select(g => new { DepartmentId = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken).ConfigureAwait(false);

        var countLookup = memberCounts.ToDictionary(m => m.DepartmentId, m => m.Count);

        return departments.Select(d => new DepartmentDto(
            d.Id, d.Name, d.Code, d.Path, d.ParentId, d.SortOrder,
            d.IsActive, countLookup.GetValueOrDefault(d.Id, 0), d.CreatedAtUtc)).ToList();
    }
}
