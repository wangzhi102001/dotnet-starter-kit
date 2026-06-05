using System.Net;
using FSH.Framework.Core.Exceptions;
using FSH.Modules.Organization.Contracts.v1.UserDepartments;
using FSH.Modules.Organization.Data;
using FSH.Modules.Organization.Domain;
using Mediator;
using Microsoft.EntityFrameworkCore;

namespace FSH.Modules.Organization.Features.v1.UserDepartments.AssignUserDepartment;

public sealed class AssignUserDepartmentCommandHandler(OrganizationDbContext dbContext)
    : ICommandHandler<AssignUserDepartmentCommand, Unit>
{
    public async ValueTask<Unit> Handle(AssignUserDepartmentCommand command, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(command);

        bool deptExists = await dbContext.Departments
            .AnyAsync(d => d.Id == command.DepartmentId, cancellationToken)
            .ConfigureAwait(false);
        if (!deptExists)
            throw new NotFoundException($"Department {command.DepartmentId} not found.");

        var existing = await dbContext.UserDepartmentAssignments
            .FirstOrDefaultAsync(ud =>
                ud.UserId == command.UserId && ud.DepartmentId == command.DepartmentId,
                cancellationToken).ConfigureAwait(false);

        if (existing is not null)
        {
            existing.Update(command.DepartmentId, command.PositionId, command.IsPrimary);
        }
        else
        {
            if (command.IsPrimary)
            {
                var currentPrimary = await dbContext.UserDepartmentAssignments
                    .Where(ud => ud.UserId == command.UserId && ud.IsPrimary)
                    .ToListAsync(cancellationToken).ConfigureAwait(false);
                foreach (var p in currentPrimary)
                    p.SetPrimary(false);
            }

            var assignment = UserDepartmentAssignment.Create(
                command.UserId, command.DepartmentId, command.PositionId, command.IsPrimary);
            dbContext.UserDepartmentAssignments.Add(assignment);
        }

        await dbContext.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        return Unit.Value;
    }
}
