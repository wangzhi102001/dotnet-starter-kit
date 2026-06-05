using Mediator;

namespace FSH.Modules.Organization.Contracts.v1.Positions;

public sealed record CreatePositionCommand(
    string Name,
    string Code,
    int SortOrder = 0) : ICommand<Guid>;
