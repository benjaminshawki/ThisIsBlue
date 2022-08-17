
import AuthCheck from "../../components/AuthCheck";
import {useState} from "react";
import {useRouter} from "next/router";
import {collection, serverTimestamp, updateDoc} from "@firebase/firestore";
import {auth, firestore} from "../../lib/firebase1";
import {doc} from "firebase/firestore";
import {useDocumentData} from "react-firebase-hooks/firestore";
import styles from "../../styles/Admin.module.css"
import {useForm} from "react-hook-form";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";
import Link from "next/link";

export default function AdminPostEdit(props) {
    return (
        <AuthCheck>
            <PostManager />
        </AuthCheck>
    )
}

function PostManager() {
    const [preview, setPreview] = useState(false);

    const router = useRouter();
    const { slug } = router.query;


    const postRef = doc(collection(doc(collection(firestore, 'users'), auth.currentUser.uid), 'posts'), slug.toString());

    const [post] = useDocumentData(postRef);

    return (
        <main className = {styles.container}>
            {post && (
                <>
                    <section>
                        <h1>{post.title}</h1>
                        <p>ID: {post.slug}</p>

                        <PostForm postRef={postRef} defaultValues={post} preview={preview} />
                    </section>
                    <aside>
                        <h3>Tools</h3>
                        <button onClick={() => setPreview(!preview)}>{preview ? 'Edit' : 'Preview'}</button>
                        <Link href={`/${post.username}/${post.slug}`}>
                            <button className={'btn-blue'}>Live view</button>
                        </Link>
                    </aside>
                </>
            )}
        </main>
    );
}

function PostForm({defaultValues, postRef, preview}){
    const { register, handleSubmit, reset, watch } = useForm({defaultValues, mode: 'onChange'});

    const updatePost = async ({content, published}) => {
        await updateDoc(postRef, {
            content,
            published,
            updatedAt: serverTimestamp(),
        });

        reset({content, published})

        toast.success('Post updated successfully!')
    }


    return (
        <form onSubmit={handleSubmit(updatePost)}>
            {preview && (
                <div className="card">
                    <ReactMarkdown>{watch('content')}</ReactMarkdown>
                </div>
            )}
            <div className={preview ? styles.hidden : styles.controls}>
                <textarea name='content' {...register('content')}></textarea>
                 <fieldset>
                     <input className={styles.checkbox} name="published" type="checkbox" {...register('published')}/>
                     <label>Published</label>
                 </fieldset>

                <button type="submit" className="btn-green">
                    Save Changes
                </button>
            </div>
        </form>

    );
}