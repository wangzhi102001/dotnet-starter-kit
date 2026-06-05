using Mediator;

namespace FSH.Modules.Organization.Contracts.v1.Positions;

public sealed record UpdatePositionCommand(
    Guid PositionId,
    string Name,
    string Code,
    int SortOrder = 0,
    bool IsActive = true) : ICommand<Unit>;
