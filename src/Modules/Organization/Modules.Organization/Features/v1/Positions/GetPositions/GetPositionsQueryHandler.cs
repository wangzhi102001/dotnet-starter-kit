using FSH.Modules.Organization.Contracts.Dtos;
using FSH.Modules.Organization.Contracts.v1.Positions;
using FSH.Modules.Organization.Data;
using Mediator;
using Microsoft.EntityFrameworkCore;

namespace FSH.Modules.Organization.Features.v1.Positions.GetPositions;

public sealed class GetPositionsQueryHandler(OrganizationDbContext dbContext)
    : IQueryHandler<GetPositionsQuery, List<PositionDto>>
{
    public async ValueTask<List<PositionDto>> Handle(GetPositionsQuery query, CancellationToken cancellationToken)
    {
        return await dbContext.Positions.AsNoTracking()
            .OrderBy(p => p.SortOrder)
            .ThenBy(p => p.Name)
            .Select(p => new PositionDto(p.Id, p.Name, p.Code, p.SortOrder, p.IsActive))
            .ToListAsync(cancellationToken).ConfigureAwait(false);
    }
}
