using FSH.Framework.Core.Domain;

namespace FSH.Modules.Organization.Domain;

public sealed class UserDepartmentAssignment : BaseEntity<Guid>
{
    private UserDepartmentAssignment() { }

    public string UserId { get; private set; } = default!;
    public Guid DepartmentId { get; private set; }
    public Guid? PositionId { get; private set; }
    public bool IsPrimary { get; private set; }
    public DateTimeOffset AssignedAtUtc { get; private set; }
    public string? AssignedBy { get; private set; }

    public static UserDepartmentAssignment Create(
        string userId,
        Guid departmentId,
        Guid? positionId = null,
        bool isPrimary = false,
        string? assignedBy = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(userId);

        return new UserDepartmentAssignment
        {
            Id = Guid.CreateVersion7(),
            UserId = userId,
            DepartmentId = departmentId,
            PositionId = positionId,
            IsPrimary = isPrimary,
            AssignedAtUtc = DateTimeOffset.UtcNow,
            AssignedBy = assignedBy
        };
    }

    public void SetPrimary(bool isPrimary)
    {
        IsPrimary = isPrimary;
    }

    public void Update(Guid departmentId, Guid? positionId, bool isPrimary)
    {
        DepartmentId = departmentId;
        PositionId = positionId;
        IsPrimary = isPrimary;
    }
}
