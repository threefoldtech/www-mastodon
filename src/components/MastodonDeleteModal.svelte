<svelte:options tag="tf-delete-modal" />
<script lang="ts">
    import { createEventDispatcher } from "svelte";    
    export let selectedInstances: string[] = [];
    
    const { Input, btn } = window.tfSvelteBulmaWc;
    const { fb, validators } = window.tfSvelteRxForms;
    const dispatch = createEventDispatcher<{ close: void, isDelete: boolean }>();

    const validateDeletion = fb.control("", [
        validators.required("Instance name is required."),
        (ctrl) => {
            if(ctrl.value != String(selectedInstances)){
                return {message: `Instance name dose not match ${String(selectedInstances)}`};
            };
        }
    ]);

</script>

<b-modal open>
    <b-modal-header>
        <b-btns align="centered" addons>
            You are about to delete your mastodon 
            <strong 
                style:color="rgb(240 58 95)"
                style:margin-right="2px"
                style:margin-left="2px"
            >
                {String(selectedInstances)}
            </strong>
            {selectedInstances.length <= 1 ? 'instance' : 'instances' },
            Are you absolutely sure?
        </b-btns>
    </b-modal-header>

    <b-modal-body>
        <b-notification color="warning" light>
            Unexpected bad things will happen if you don't read this!
        </b-notification>

        This action <strong>cannot</strong> be undone. This will permanently delete the
        <strong style:color="rgb(240 58 95)">{String(selectedInstances)}</strong> 
        {selectedInstances.length <= 1 ? 'database' : 'databases' }
        contains its all records posts, comments, users and all other tables.

        Please type 
        <strong 
            style:color="rgb(240 58 95)"
        >
            {String(selectedInstances)}
        </strong>
        to confirm.

        <Input
            label=""
            placeholder={String(selectedInstances)}
            type="text"
            controller={validateDeletion}
        />
    </b-modal-body> 

    <b-modal-actions>
        <b-btns align="right" size="small">
            <button
                use:btn={{ color: "danger" }}
                type="button"
                on:click={() => {
                    dispatch("isDelete", true);
                }}
                disabled={!$validateDeletion.valid}
            >
                Delete {selectedInstances.length <= 1 ? 'this instance' : 'those instances' }
            </button>

            <button
                use:btn={{ color: "primary" }}
                on:click={() => {
                    dispatch("close");
                }}
                type="button"
                >
                Close
            </button>
        </b-btns>
    </b-modal-actions>
</b-modal>

