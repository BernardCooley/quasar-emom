<template>
    <div class="commentsContainer" :style="{ 'flex-direction': [commentsOpen ? 'column-reverse' : 'column']}">
        <div v-on:click="toggleCommentsSection()" :class="[commentsOpen ? 'commentsOpened' : 'commentsClosed', 'commentsSection']">
            <img class="tracksChevron" src="statics/icons/right-chevron.svg"/>
            <div class="">Comments</div>
            <img class="tracksChevron" src="statics/icons/right-chevron.svg"/>
        </div>
        <div v-if="commentsExpanded" class="commentsExpanded">
            <q-field label="Add comment">
                <q-input type="textarea" id="comment" v-model="comment"/>
            </q-field>
            <q-btn v-on:click.prevent="addComment()">Submit</q-btn>
            <div class="commentListContainer">
                <div v-for="(comment, index) in comments" :key="index">
                    <q-item class="commentConatainer">
                        <div class="commentHeader">
                            <div class="commentAuthor">{{comment.author}}</div>
                            <div class="commentDateTime">{{comment.date}}:{{comment.time}}</div>
                        </div>
                        <div class="commentMessage">{{comment.message}}</div>
                    </q-item>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapMutations, mapState } from "vuex"

export default {
    name: 'comments',
    data() {
        return {
            comment: ''
        }
    },
    computed: {
        ...mapState(['trackComments', 'commentsOpen']),
        comments() {
            return this.trackComments
        },
        commentsExpanded() {
            return this.commentsOpen
        }
    },
    methods: {
        ...mapMutations(['GET_TRACK_COMMENTS', 'TOGGLE_COMMENTS']),
        addComment() {
            this.$store.commit('ADD_COMMENT', this.comment)
        },
        toggleCommentsSection() {
            this.$store.commit('TOGGLE_COMMENTS')
            this.$store.commit('GET_TRACK_COMMENTS')
        }
    }
}
</script>

<style lang="scss" scoped>
@import "../css/commonStyles.scss";

.commentsContainer {
    height: auto;
    height: auto;
    display: flex;
    flex-direction: column;
}

.commentsSection {
    display: flex;
    width: 100%;
    justify-content: space-around;
    height: 50px;
    align-items: center;

    img {
        height: 20px;
    }
}

.commentsOpened {
    img {
        transform: rotate(270deg);
    }
}

.commentsClosed {
    img {
        transform: rotate(90deg);
    }
}

.commentsExpanded {
    height: 400px;
}
.commentConatainer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    border-top: 1px solid lightgray;
}
.commentHeader {
    display: flex;
    width: 100%;
    justify-content: space-between;
}
.commentMessage {
    overflow-wrap: break-word;
    width: 85%;
    margin: 15px;
    font-size: 19px;
}
.commentListContainer {
    margin-top: 20px;
}
</style>
