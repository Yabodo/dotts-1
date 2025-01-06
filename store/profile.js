export const state = () => ({
    list: []
})
  
export const mutations = {
    add(state, text) {
        state.list.push({
            text,
            done: false
        })
    },
    remove(state, { todo }) {
        state.list.splice(state.list.indexOf(todo), 1)
    },
    toggle(state, todo) {
        todo.done = !todo.done
    }
}

export const actions = {
    test() {
        console.log("profileAction worx");
        console.log(this.$nhost.auth.currentUser.id)
    },
    async updateAvatar(context, filer) {
        if (filer) {
            console.log(filer);
            const response = await this.$nhost.storage.put(`/public/avatar/${this.$nhost.auth.currentUser.id}`, filer)
            console.log(response)
        }
    },
}