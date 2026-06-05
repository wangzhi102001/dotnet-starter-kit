using FSH.Framework.Core.Exceptions;
using FSH.Modules.Organization.Contracts.v1.Positions;
using FSH.Modules.Organization.Data;
using Mediator;
using Microsoft.EntityFrameworkCore;

namespace FSH.Modules.Organization.Features.v1.Positions.DeletePosition;

public sealed class DeletePositionCommandHandler(OrganizationDbContext dbContext)
    : ICommandHandler<DeletePositionCommand, Unit>
{
    public async ValueTask<Unit> Handle(DeletePositionCommand command, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(command);

        var position = await dbContext.Positions
            .FirstOrDefaultAsync(p => p.Id == command.PositionId, cancellationToken)
            .ConfigureAwait(false)
            ?? throw new NotFoundException($"Position {command.PositionId} not found.");

        bool inUse = await dbContext.UserDepartmentAssignments
            .AnyAsync(ud => ud.PositionId == command.PositionId, cancellationToken)
            .ConfigureAwait(false);
        if (inUse)
        {
            throw new FSH.Framework.Core.Exceptions.CustomException(
                "Cannot delete a position that is assigned to users. Reassign the users first.",
                (IEnumerable<string>?)null,
                System.Net.HttpStatusCode.Conflict);
        }

        dbContext.Positions.Remove(position);
        await dbContext.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        return Unit.Value;
    }
}
