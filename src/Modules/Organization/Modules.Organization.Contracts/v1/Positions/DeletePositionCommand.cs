using Mediator;

namespace FSH.Modules.Organization.Contracts.v1.Positions;

public sealed record DeletePositionCommand(Guid PositionId) : ICommand<Unit>;
