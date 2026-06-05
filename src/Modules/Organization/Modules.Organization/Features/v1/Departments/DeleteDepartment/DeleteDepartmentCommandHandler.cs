using System.Net;
using FSH.Framework.Core.Exceptions;
using FSH.Modules.Organization.Contracts.v1.Departments;
using FSH.Modules.Organization.Data;
using Mediator;
using Microsoft.EntityFrameworkCore;

namespace FSH.Modules.Organization.Features.v1.Departments.DeleteDepartment;

public sealed class DeleteDepartmentCommandHandler(OrganizationDbContext dbContext)
    : ICommandHandler<DeleteDepartmentCommand, Unit>
{
    public async ValueTask<Unit> Handle(DeleteDepartmentCommand command, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(command);

        bool hasChildren = await dbContext.Departments
            .AnyAsync(d => d.ParentId == command.DepartmentId, cancellationToken)
            .ConfigureAwait(false);
        if (hasChildren)
        {
            throw new CustomException(
                "Cannot delete a department that has sub-departments. Remove or move the sub-departments first.",
                (IEnumerable<string>?)null,
                HttpStatusCode.Conflict);
        }

        var department = await dbContext.Departments
            .FirstOrDefaultAsync(d => d.Id == command.DepartmentId, cancellationToken)
            .ConfigureAwait(false)
            ?? throw new NotFoundException($"Department {command.DepartmentId} not found.");

        dbContext.Departments.Remove(department);
        await dbContext.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        return Unit.Value;
    }
}
