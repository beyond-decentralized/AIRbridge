# @airbridge/validate

Move from server side templates to SPAs introduced a new problem:

In server-side UI frameworks the UI state resided on the server, in 
session objects.  This means that there was no need to validate it,
it was already known to be valid.  With SPAs the display and UI
logic moved to the client and the data model is being transfered
from the client back to the server.  This means that the passed
in data model must be validated.

AIRport removes the client-to-server gap by allowing to pass
entity objects all the way to the client and back.  This means that
there must be strict validation of all entity state passed in and
out of protected server scope.  Doing so via procedural checks
is tedious and error prone.  To solve this issue
@airport/airbridge-validate library has been introduced.

@airbridge/validate provides a declarative DSL for
validating entity model trees:

```typescript
@Entity()
export class Parent extends AirEntity {

    value: string;

    @OneToMany({mappedBy: 'parent'})
    children: Child[];
}

@Entity()
export class Child extends AirEntity {

    value: string;

    @ManyToOne()
    parent: Parent;
}

@Injected()
export class ParentDvo extends BaseParentDvo {

    myParentValidator = this.validator(parent => ({
            value: oneOf('Great Parent', 'Best Parent'),
            children: or(
                exists(),
                {
                    value: length(3, 50)
                })
        }))

    async validateParent(parent: Parent) {
        await this.validate(parent, this.myParentValidator)
    }

}
```

AIRport entity objects retain original values.  This allows to
compute if a property value has been modified.  Dvo.validate
will throw an exception if a property
has been modified (or its a newly created entity object) and
there is no validator defined for it.

The object graph passed into @Api() methods get's copied before
it is passed in.  On the completion of the @Api() request
the passed in object gets reconciled with the copy that was
used internally.  This allows to modify temporary internal state
parameters for the purpose of validation.  Dvo.validate will
exclude from persistence operations (via adding temporary
internal state flags) all entity objects that are not covered
by its validation operations.  The temporary internal flag
that governs exclusion of entities from peristence operations
is not copied over to the object originally passed into
the @Api() call.

Existance checks in validators check if the object exists (by
Id) and update the state of the object with the latest found
in the database, if the passed in object does not have the
passed in properies marked as modified.  These changes
are then copied over to the client.  This the client does
not have to requiry for latest state of the object (which
are updated by both the validation and the persistence APIs).
