using FSH.Framework.Core.Exceptions;
using FSH.Modules.Organization.Contracts.v1.Departments;
using FSH.Modules.Organization.Data;
using Mediator;
using Microsoft.EntityFrameworkCore;

namespace FSH.Modules.Organization.Features.v1.Departments.UpdateDepartment;

public sealed class UpdateDepartmentCommandHandler(OrganizationDbContext dbContext)
    : ICommandHandler<UpdateDepartmentCommand, Unit>
{
    public async ValueTask<Unit> Handle(UpdateDepartmentCommand command, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(command);

        var department = await dbContext.Departments
            .FirstOrDefaultAsync(d => d.Id == command.DepartmentId, cancellationToken)
            .ConfigureAwait(false)
            ?? throw new NotFoundException($"Department {command.DepartmentId} not found.");

        department.Update(command.Name, command.Code, command.ParentId, command.SortOrder, command.IsActive);

        await dbContext.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        return Unit.Value;
    }
}
