using FSH.Framework.Core.Exceptions;
using FSH.Modules.Organization.Contracts.v1.Positions;
using FSH.Modules.Organization.Data;
using Mediator;
using Microsoft.EntityFrameworkCore;

namespace FSH.Modules.Organization.Features.v1.Positions.UpdatePosition;

public sealed class UpdatePositionCommandHandler(OrganizationDbContext dbContext)
    : ICommandHandler<UpdatePositionCommand, Unit>
{
    public async ValueTask<Unit> Handle(UpdatePositionCommand command, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(command);

        var position = await dbContext.Positions
            .FirstOrDefaultAsync(p => p.Id == command.PositionId, cancellationToken)
            .ConfigureAwait(false)
            ?? throw new NotFoundException($"Position {command.PositionId} not found.");

        position.Update(command.Name, command.Code, command.SortOrder, command.IsActive);

        await dbContext.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        return Unit.Value;
    }
}
