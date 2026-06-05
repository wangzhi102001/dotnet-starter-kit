using FluentValidation;
using FSH.Modules.Organization.Contracts.v1.UserDepartments;

namespace FSH.Modules.Organization.Features.v1.UserDepartments.AssignUserDepartment;

public sealed class AssignUserDepartmentCommandValidator : AbstractValidator<AssignUserDepartmentCommand>
{
    public AssignUserDepartmentCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.DepartmentId).NotEmpty();
    }
}
