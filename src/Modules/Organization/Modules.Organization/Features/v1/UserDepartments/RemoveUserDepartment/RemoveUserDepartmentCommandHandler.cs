using FSH.Framework.Core.Exceptions;
using FSH.Modules.Organization.Contracts.v1.UserDepartments;
using FSH.Modules.Organization.Data;
using Mediator;
using Microsoft.EntityFrameworkCore;

namespace FSH.Modules.Organization.Features.v1.UserDepartments.RemoveUserDepartment;

public sealed class RemoveUserDepartmentCommandHandler(OrganizationDbContext dbContext)
    : ICommandHandler<RemoveUserDepartmentCommand, Unit>
{
    public async ValueTask<Unit> Handle(RemoveUserDepartmentCommand command, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(command);

        var assignment = await dbContext.UserDepartmentAssignments
            .FirstOrDefaultAsync(ud =>
                ud.UserId == command.UserId && ud.DepartmentId == command.DepartmentId,
                cancellationToken).ConfigureAwait(false)
            ?? throw new NotFoundException(
                $"User {command.UserId} is not assigned to department {command.DepartmentId}.");

        dbContext.UserDepartmentAssignments.Remove(assignment);
        await dbContext.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        return Unit.Value;
    }
}
