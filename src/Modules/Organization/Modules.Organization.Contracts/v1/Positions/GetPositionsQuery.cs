using FSH.Modules.Organization.Contracts.Dtos;
using Mediator;

namespace FSH.Modules.Organization.Contracts.v1.Positions;

public sealed record GetPositionsQuery : IQuery<List<PositionDto>>;
