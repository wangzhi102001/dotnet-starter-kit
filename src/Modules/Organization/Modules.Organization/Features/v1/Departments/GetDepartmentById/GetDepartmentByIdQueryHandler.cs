using FSH.Framework.Core.Exceptions;
using FSH.Modules.Organization.Contracts.Dtos;
using FSH.Modules.Organization.Contracts.v1.Departments;
using FSH.Modules.Organization.Data;
using Mediator;
using Microsoft.EntityFrameworkCore;

namespace FSH.Modules.Organization.Features.v1.Departments.GetDepartmentById;

public sealed class GetDepartmentByIdQueryHandler(OrganizationDbContext dbContext)
    : IQueryHandler<GetDepartmentByIdQuery, DepartmentDto>
{
    public async ValueTask<DepartmentDto> Handle(GetDepartmentByIdQuery query, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(query);

        var department = await dbContext.Departments.AsNoTracking()
            .FirstOrDefaultAsync(d => d.Id == query.DepartmentId, cancellationToken).ConfigureAwait(false)
            ?? throw new NotFoundException($"Department {query.DepartmentId} not found.");

        var memberCount = await dbContext.UserDepartmentAssignments
            .CountAsync(ud => ud.DepartmentId == query.DepartmentId, cancellationToken).ConfigureAwait(false);

        return new DepartmentDto(
            department.Id, department.Name, department.Code, department.Path,
            department.ParentId, department.SortOrder, department.IsActive,
            memberCount, department.CreatedAtUtc);
    }
}
