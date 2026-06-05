using FSH.Framework.Core.Domain;

namespace FSH.Modules.Organization.Domain;

public sealed class Department : AggregateRoot<Guid>, ISoftDeletable
{
    private Department() { }

    public string Name { get; private set; } = default!;
    public string Code { get; private set; } = default!;
    public string? Path { get; private set; }
    public Guid? ParentId { get; private set; }
    public int SortOrder { get; private set; }
    public bool IsActive { get; private set; }
    public DateTimeOffset CreatedAtUtc { get; private set; }
    public DateTimeOffset? UpdatedAtUtc { get; private set; }
    public bool IsDeleted { get; private set; }
    public DateTimeOffset? DeletedOnUtc { get; private set; }
    public string? DeletedBy { get; private set; }

    public static Department Create(string name, string code, Guid? parentId = null, int sortOrder = 0)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        ArgumentException.ThrowIfNullOrWhiteSpace(code);

        return new Department
        {
            Id = Guid.CreateVersion7(),
            Name = name.Trim(),
            Code = code.Trim().ToUpperInvariant(),
            ParentId = parentId,
            SortOrder = sortOrder,
            IsActive = true,
            CreatedAtUtc = DateTimeOffset.UtcNow
        };
    }

    public void Update(string name, string code, Guid? parentId, int sortOrder, bool isActive)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        ArgumentException.ThrowIfNullOrWhiteSpace(code);

        if (parentId == Id)
            throw new ArgumentException("A department cannot be its own parent.");

        Name = name.Trim();
        Code = code.Trim().ToUpperInvariant();
        ParentId = parentId;
        SortOrder = sortOrder;
        IsActive = isActive;
        UpdatedAtUtc = DateTimeOffset.UtcNow;
    }

    public void SetPath(string path)
    {
        Path = path;
        UpdatedAtUtc = DateTimeOffset.UtcNow;
    }
}
