using System.Net;
using FSH.Framework.Core.Exceptions;
using FSH.Modules.Organization.Contracts.v1.Positions;
using FSH.Modules.Organization.Data;
using FSH.Modules.Organization.Domain;
using Mediator;
using Microsoft.EntityFrameworkCore;

namespace FSH.Modules.Organization.Features.v1.Positions.CreatePosition;

public sealed class CreatePositionCommandHandler(OrganizationDbContext dbContext)
    : ICommandHandler<CreatePositionCommand, Guid>
{
    public async ValueTask<Guid> Handle(CreatePositionCommand command, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(command);

        string normalizedCode = command.Code.Trim().ToUpperInvariant();

        bool codeTaken = await dbContext.Positions
            .AnyAsync(p => p.Code == normalizedCode, cancellationToken)
            .ConfigureAwait(false);
        if (codeTaken)
        {
            throw new CustomException(
                $"A position with code '{command.Code}' already exists.",
                (IEnumerable<string>?)null,
                HttpStatusCode.Conflict);
        }

        var position = Position.Create(command.Name, command.Code, command.SortOrder);

        dbContext.Positions.Add(position);
        await dbContext.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        return position.Id;
    }
}
