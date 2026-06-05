using FluentValidation;
using FSH.Modules.Organization.Contracts.v1.UserDepartments;

namespace FSH.Modules.Organization.Features.v1.UserDepartments.RemoveUserDepartment;

public sealed class RemoveUserDepartmentCommandValidator : AbstractValidator<RemoveUserDepartmentCommand>
{
    public RemoveUserDepartmentCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.DepartmentId).NotEmpty();
    }
}
