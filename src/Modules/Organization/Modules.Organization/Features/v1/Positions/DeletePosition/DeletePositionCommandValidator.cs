using FluentValidation;
using FSH.Modules.Organization.Contracts.v1.Positions;

namespace FSH.Modules.Organization.Features.v1.Positions.DeletePosition;

public sealed class DeletePositionCommandValidator : AbstractValidator<DeletePositionCommand>
{
    public DeletePositionCommandValidator()
    {
        RuleFor(x => x.PositionId).NotEmpty();
    }
}
