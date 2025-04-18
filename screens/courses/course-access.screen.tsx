import React, { useCallback, useEffect, useRef, useState } from "react";
import QuestionsCard from "@/components/cards/question.card";
import ReviewCard from "@/components/cards/review.card";
import Loader from "@/components/loader";
import useUser from "@/hooks/useUser";
import { URL_SERVER, URL_VIDEO, URL_VIDEOS } from "@/utils/url";
import { Feather, FontAwesome, AntDesign, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Animated, Dimensions, FlatList, Linking, Modal, PanResponder, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { widthPercentageToDP } from "react-native-responsive-screen";
import { Toast } from "react-native-toast-notifications";
import app from "../../app.json";
import { Video, ResizeMode } from 'expo-av';
import { useDispatch } from "react-redux";
import * as userActions from '../../utils/store/actions';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fe",
        padding: 15,
    },
    videoContainer: {
        width: "100%", 
        aspectRatio: 16 / 9, 
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    navigationContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    button: {
        width: widthPercentageToDP("42%"),
        height: 48,
        marginVertical: 10,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    textBtn: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
        fontFamily: "Nunito_600SemiBold"
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 15,
        color: "#1a1a2e",
    },
    tabContainer: {
        flexDirection: "row",
        marginVertical: 0,
        backgroundColor: "#E1E9F8",
        borderRadius: 50,
        width: '100%',
        justifyContent: "space-between",
        padding: 4,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 50,
    },
    tabText: {
        fontSize: 16,
        fontFamily: "Nunito_600SemiBold"
    },
    contentContainer: {
        marginVertical: 20,
        paddingBottom: 100,
    },
    inputContainer: {
        backgroundColor: "#FFF",
        borderRadius: 16,
        padding: 15,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        marginBottom: 15,
    },
    input: {
        flex: 1,
        textAlignVertical: "top",
        justifyContent: "flex-start",
        backgroundColor: "#FFF",
        borderRadius: 12,
        minHeight: 100,
        padding: 12,
        fontFamily: "Nunito_500Medium",
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#E1E9F8",
    },
    actionButton: {
        height: 45,
        minWidth: 130,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        flexDirection: 'row',
        gap: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    referenceContainer: {
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    noteButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 48,
        height: 48,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 6.27,
        elevation: 10,
    },
    linkItem: {
        paddingVertical: 6,
        marginVertical: 3,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    linkTitle: {
        fontSize: 15,
        fontWeight: "500",
        color: "#2467EC",
        marginBottom: 3,
        fontFamily: "Nunito_500Medium",
        textDecorationLine: 'underline',
    },
    linkUrl: {
        fontSize: 14,
        color: "#2467EC",
        fontFamily: "Nunito_500Medium"
    },
    description: {
        color: "#525258", 
        fontSize: 15,
        marginTop: 10,
        lineHeight: 22,
        textAlign: "justify",
        fontFamily: "Nunito_500Medium"
    },
    descriptionWithBorder: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 8,
    },
    lessonListButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2467EC',
    },
    lessonItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    activeLesson: {
        backgroundColor: '#f0f7ff',
    },
    lessonNumber: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#2467EC',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    lessonNumberText: {
        color: 'white',
        fontWeight: 'bold',
    },
    lessonTitle: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    completedIcon: {
        marginLeft: 10,
        color: '#35B58D',
    },
    contentFrame: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginTop: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1a1a2e",
        marginBottom: 8,
        fontFamily: "Nunito_600SemiBold"
    }
});

const CourseAccessScreen = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useUser();
    const { courseData, courseId } = useLocalSearchParams();
    const data: CoursesType = JSON.parse(courseData as string);
    const [courseReviews, setCourseReviews] = useState<ReviewType[]>(data?.reviews ? data.reviews : []);

    const [courseContentData, setCourseContentData] = useState<CourseDataType[]>([]);
    const [activeVideo, setActiveVideo] = useState(0);
    const [activeButton, setActiveButton] = useState("About");
    const [question, setQuestion] = useState("");
    const [rating, setRating] = useState(1);
    const [review, setReview] = useState("");
    const [reviewAvailable, setReviewAvailable] = useState(false);
    const [token, setToken] = useState({
        access: '',
        refresh: ''
    });
    const [videoData, setVideoData] = useState('');
    const [courseProgress, setCourseProgress] = useState<Progress>();
    const [lessonInfo, setLessonInfo] = useState<Chapter>({
        chapterId: "",
        isCompleted: false
    });
    const [isLessonListVisible, setIsLessonListVisible] = useState(false);
    
    const dispatch = useDispatch();
    const videoRef = useRef<Video>(null);
    
    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    useEffect(() => {
        if (courseContentData[activeVideo]) {
            loadVideoAndChapterState();
        }
    }, [courseContentData[activeVideo], activeVideo])

    const loadVideoAndChapterState = async  () => {
        try {
            let _lessonInfo = courseProgress?.chapters.find(chapter => chapter.chapterId === courseContentData[activeVideo]?._id);
            let _clone = {
                chapterId: _lessonInfo?.chapterId,
                isCompleted: _lessonInfo?.isCompleted
            } as Chapter;
            setLessonInfo(_clone);
            const accessToken = await AsyncStorage.getItem('access_token');
            const refreshToken = await AsyncStorage.getItem('refresh_token');
            const response = await axios.get(`${URL_VIDEO}/api/files/${courseContentData[activeVideo].videoUrl}`, {
                headers: {
                    'access-token': accessToken,
                    'refresh-token': refreshToken
                }
            })
            if(response.data){
                setVideoData(response.data.url);
            }
        } catch (error) {
            console.log(error);
            setIsLoading(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            const subscription = async () => {
                await loadProgressOfUser();
                await FetchCourseContent();
                const isReviewAvailable = courseReviews.find(
                    (i: any) => i?.user?._id === user?._id
                )
                if (isReviewAvailable) {
                    setReviewAvailable(true);
                }
            }
            subscription();
        }, [])
    )

    const loadProgressOfUser = async () => {
        try {
            const accessToken = await AsyncStorage.getItem('access_token');
            const refreshToken = await AsyncStorage.getItem('refresh_token');
            const response = await axios.get(`${URL_SERVER}/user/progress`, {
                headers: {
                    'access-token': accessToken,
                    'refresh-token': refreshToken
                }
            });
            let _progress: Progress[] = [];
            if(response.data.response && response.data.response.progress){
                let _ = response.data.response.progress;
                _progress = _.map((progress: Progress) => ({
                    courseId: progress.courseId,
                    chapters: progress.chapters.map((chapter: Chapter) => ({
                        chapterId: chapter.chapterId,
                        isCompleted: chapter.isCompleted
                    }))
                }));
            }
            if(_progress.length > 0){
                let progressOfCourse = _progress.filter(pro => pro.courseId === courseId)[0];
                let _clone = {
                    courseId: progressOfCourse.courseId,
                    chapters: progressOfCourse.chapters
                } as Progress;
                setCourseProgress(_clone);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const FetchCourseContent = async () => {
        try {
            const accessToken = await AsyncStorage.getItem("access_token");
            const refreshToken = await AsyncStorage.getItem("refresh_token");
            const response = await axios.get(`${URL_SERVER}/get-course-content/${courseId}`, {
                headers: {
                    "access-token": accessToken,
                    "refresh-token": refreshToken
                }
            });
            if(response.data){
                setCourseContentData(response.data.content);
            }
            setToken({
                access: accessToken as string,
                refresh: refreshToken as string
            })
            setIsLoading(false);
        } catch (error) {
            console.log(error);
            setIsLoading(false);
            router.push({
                pathname: "/(routes)/course-details",
                params: { item: JSON.stringify(data), courseId: data?._id },
            });
        }
    }

    const OnHandleQuestionSubmit = async () => {
        try {
            const accessToken = await AsyncStorage.getItem("access_token");
            const refreshToken = await AsyncStorage.getItem("refresh_token");
            await axios.put(`${URL_SERVER}/add-question`, {
                question: question,
                courseId: courseId,
                contentId: courseContentData[activeVideo]?._id
            }, {
                headers: {
                    "access-token": accessToken,
                    "refresh-token": refreshToken
                }
            });
            setQuestion("");
            Toast.show("Câu hỏi đã tạo mới thành công!", {
                placement: "bottom",
                type: "success"
            });
            await FetchCourseContent();
        } catch (error) {
            console.log(error);
        }
    }

    const OnHandleReviewSubmit = async () => {
        try {
            const accessToken = await AsyncStorage.getItem("access_token");
            const refreshToken = await AsyncStorage.getItem("refresh_token");
            await axios.put(`${URL_SERVER}/add-review/${courseId}`,
                { review, rating },
                {
                    headers: {
                        "access-token": accessToken,
                        "refresh-token": refreshToken
                    }
                }
            );
            setRating(1);
            setReview("");
            let currentCourseReview = courseReviews;
            let _data: ReviewType = {
                user: user!,
                comment: review,
                rating: rating
            }
            currentCourseReview = [_data, ...currentCourseReview];
            setCourseReviews(currentCourseReview);
        } catch (error) {
            console.log(error);
        }
    }

    const OnMarkAsCompleted = async () => {
        try {
            const accessToken = await AsyncStorage.getItem('access_token');
            const refreshToken = await AsyncStorage.getItem('refresh_token');
            const chapterId = lessonInfo.chapterId;
            const courseId = courseProgress?.courseId;
            await axios.put(`${URL_SERVER}/user/mark-chapter?courseId=${courseId}&chapterId=${chapterId}`, {}, {
                headers: {
                    'access-token': accessToken,
                    'refresh-token': refreshToken
                }
            });
            let newChapters = courseProgress?.chapters.filter(chapter => chapter.chapterId !== chapterId);
            newChapters?.push({
                chapterId: chapterId, 
                isCompleted: true
            } as Chapter);
            // Update lại các bài học hoàn thành để dùng cho các lần sau
            let currCourseProgress = {
                courseId: courseProgress?.courseId,
                chapters: newChapters
            } as Progress
            setCourseProgress(currCourseProgress);
            setLessonInfo({
                chapterId: chapterId,
                isCompleted: true
            });
            let newProgress = calculateProgressBar(newChapters ?? []); 
            let payload = {
                courseId: courseId + '',
                progress: newProgress,
                name: data.name,
                total: courseProgress?.chapters.length ?? 0
            }
            dispatch(userActions.pushProgressOfUser(payload));
        } catch (error) {
            console.log(error);
        }
    }

    const calculateProgressBar = (chapters: Chapter[]) => {
        let isCompleted = 0;
        chapters.forEach(chapter => {
            if(chapter.isCompleted){
                isCompleted++;
            }
        })
        let progress = isCompleted / chapters.length;
        return progress;
    }

    const RenderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <TouchableOpacity key={i} onPress={() => setRating(i)}>
                    <FontAwesome
                        name={i <= rating ? "star" : "star-o"}
                        size={22}
                        color={"#FF8D07"}
                        style={{ marginHorizontal: 3, marginBottom: 10 }}
                    />
                </TouchableOpacity>
            )
        }
        return stars;
    }

    const handleLessonSelect = (index: number) => {
        setActiveVideo(index);
        setIsLessonListVisible(false);
    };
    
    const isLessonCompleted = (chapterId: string) => {
        return courseProgress?.chapters.some(
            chapter => chapter.chapterId === chapterId && chapter.isCompleted
        ) || false;
    };

    return (
        <>
            {isLoading ? (
                <Loader />
            ) : (
                <ScrollView style={styles.container}>
                    <Animated.View 
                        style={[
                            styles.videoContainer, 
                            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] 
                        }]}>
                        <TouchableOpacity 
                            style={styles.lessonListButton}
                            onPress={() => setIsLessonListVisible(true)}
                        >
                            <MaterialIcons name="format-list-bulleted" size={24} color="white" />
                        </TouchableOpacity>
                        
                        {videoData ? (
                            <Video 
                                ref={videoRef}
                                source={{
                                    uri: videoData.startsWith('http') ? videoData : `${URL_VIDEO}${videoData}`,
                                    headers: {
                                        'access-token': token.access,
                                        'refresh-token': token.refresh
                                    }
                                }}
                                style={{width: '100%', height: '100%'}}
                                useNativeControls
                                resizeMode={ResizeMode.CONTAIN}
                                onError={(error) => console.log('Video Error:', error)}
                                onLoad={() => console.log('Video loaded successfully')}
                                shouldPlay={false}
                                isLooping={false}
                                isMuted={false}
                            />
                        ) : (
                            <View style={{width: '100%', height: 200, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center'}}>
                                <Text>Loading video...</Text>
                            </View>
                        )}
                    </Animated.View>
                    
                    <View style={styles.navigationContainer}>
                        <TouchableOpacity
                            disabled={activeVideo === 0}
                            onPress={() => setActiveVideo(activeVideo - 1)}
                        >
                            <LinearGradient
                                colors={activeVideo === 0 ? ['#a0a0a0', '#888888'] : ['#5D87E4', '#4776E6']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.button}
                            >
                                <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                                    <AntDesign name="left" size={16} color="#FFF" />
                                    <Text style={styles.textBtn}>Quay lại</Text>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            disabled={activeVideo === courseContentData.length - 1}
                            onPress={() => setActiveVideo(activeVideo + 1)}
                        >
                            <LinearGradient
                                colors={(activeVideo === courseContentData.length - 1) ? ['#a0a0a0', '#888888'] : ['#E56767', '#D84848']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.button}
                            >
                                <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                                    <Text style={styles.textBtn}>Tiếp theo</Text>
                                    <AntDesign name="right" size={16} color="#FFF" />
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                    
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        <Text style={styles.title}>
                            {activeVideo + 1}. {courseContentData[activeVideo]?.title}
                        </Text>
                    </Animated.View>
                    
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[
                                styles.tabButton,
                                {backgroundColor: activeButton === "About" ? "#2467EC" : "transparent"}
                            ]}
                            onPress={() => setActiveButton("About")}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    {color: activeButton === "About" ? "#FFF" : "#333"}
                                ]}
                            >
                                Chi tiết
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.tabButton,
                                {backgroundColor: activeButton === "Q&A" ? "#2467EC" : "transparent"}
                            ]}
                            onPress={() => setActiveButton("Q&A")}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    {color: activeButton === "Q&A" ? "#FFF" : "#333"}
                                ]}
                            >
                                Hỏi đáp
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.tabButton,
                                {backgroundColor: activeButton === "Reviews" ? "#2467EC" : "transparent"}
                            ]}
                            onPress={() => setActiveButton("Reviews")}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    {color: activeButton === "Reviews" ? "#FFF" : "#333"}
                                ]}
                            >
                                Đánh giá
                            </Text>
                        </TouchableOpacity>
                    </View>
                    
                    {activeButton === "About" && (
                        <Animated.View
                            style={[
                                styles.contentContainer,
                                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                            ]}
                        >
                            <View style={{marginVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 10}}>
                                <TouchableOpacity
                                    onPress={() => router.push({
                                        pathname: '/course-quizz',
                                        params: {
                                            courseData: courseData,
                                            activeVideo: activeVideo,
                                            id: courseId
                                        }
                                    })}
                                >
                                    <LinearGradient
                                        colors={['#4A90E2', '#5A9AE6']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.actionButton}
                                    >
                                        <Text style={styles.textBtn}>
                                            Kiểm tra
                                        </Text>
                                        <AntDesign name="form" size={16} color="white" />
                                    </LinearGradient>
                                </TouchableOpacity>
                                
                                { lessonInfo.isCompleted ? (
                                    <TouchableOpacity
                                        style={{marginLeft: 'auto'}}
                                    >
                                        <LinearGradient
                                            colors={['#2E9E7A', '#35B58D']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.actionButton}
                                        >
                                            <Text style={styles.textBtn}>
                                                Đã hoàn thành
                                            </Text>
                                            <Feather name="check-circle" size={18} color="white" />
                                        </LinearGradient>
                                    </TouchableOpacity>
                                ):(
                                    <TouchableOpacity
                                        onPress={() => OnMarkAsCompleted()}
                                        style={{marginLeft: 'auto'}}
                                    >
                                        <LinearGradient
                                            colors={['#4776E6', '#5D87E4']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.actionButton}
                                        >
                                            <Text style={styles.textBtn}>
                                                Đánh dấu hoàn thành
                                            </Text>
                                            <Feather name="check" size={18} color="white" />
                                        </LinearGradient>
                                    </TouchableOpacity>
                                )}
                            </View>
                            
                            <View style={{marginTop: 20}}>
                                <View style={styles.referenceContainer}>
                                    <Text style={{ fontSize: 20, fontWeight: "bold", color: "#1a1a2e" }}>
                                        Nội dung
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => router.push({
                                            pathname: '/(routes)/note-lesson',
                                            params: {
                                                courseId: courseId,
                                                courseDataId: lessonInfo.chapterId, 
                                                name: data.name,
                                                nameLesson: `${courseContentData[activeVideo].title}`
                                            }
                                        })}
                                    >
                                        <LinearGradient
                                            colors={['#E67E5D', '#E67E5D']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.noteButton}
                                        >
                                            <FontAwesome name="sticky-note" size={20} color="white" />
                                        </LinearGradient>
                                    </TouchableOpacity> 
                                </View>
                                
                                <View style={styles.contentFrame}>
                                    {courseContentData[activeVideo]?.links && courseContentData[activeVideo]?.links.length > 0 && (
                                        <>
                                            {courseContentData[activeVideo]?.links.map((link: LinkType, index: number) => (
                                                <TouchableOpacity
                                                    key={`indexavjkahfkahkas-${index}`}
                                                    style={styles.linkItem}
                                                    onPress={() => {
                                                        // Open the URL in external browser
                                                        if (link.url) {
                                                            Linking.openURL(link.url).catch(err => 
                                                                console.error("Couldn't open URL: ", err)
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <Text style={styles.linkTitle}>
                                                        Tham khảo: {link.title}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </>
                                    )}
                                    
                                    <Text 
                                        style={[
                                            styles.description, 
                                            courseContentData[activeVideo]?.links && 
                                            courseContentData[activeVideo]?.links.length > 0 ? 
                                            styles.descriptionWithBorder : null
                                        ]}
                                    >
                                        {courseContentData[activeVideo]?.description}
                                    </Text>
                                </View>
                            </View>
                        </Animated.View>
                    )}
                    
                    {activeButton === "Q&A" && (
                        <Animated.View 
                            style={[
                                styles.contentContainer,
                                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                            ]}
                        >
                            <View style={styles.inputContainer}>
                                <TextInput
                                    value={question}
                                    onChangeText={(v) => setQuestion(v)}
                                    placeholder="Đặt câu hỏi của bạn tại đây..."
                                    style={styles.input}
                                    multiline
                                />
                                <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 15 }}>
                                    <TouchableOpacity
                                        disabled={question === ""}
                                        onPress={() => OnHandleQuestionSubmit()}
                                    >
                                        <LinearGradient
                                            colors={question === "" ? ['#a0a0a0', '#888888'] : ['#4776E6', '#5D87E4']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.actionButton}
                                        >
                                            <Text style={styles.textBtn}>Gửi câu hỏi</Text>
                                            <Feather name="send" size={16} color="white" />
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            
                            <View style={{ marginBottom: 20 }}>
                                {courseContentData[activeVideo]?.questions
                                    ?.slice()
                                    ?.reverse()
                                    .map((item: CommentType, index: number) => (
                                        <Animated.View 
                                            key={`${index}-f`}
                                            style={{ 
                                                opacity: fadeAnim, 
                                                transform: [{ translateY: slideAnim }],
                                                marginBottom: 15 
                                            }}
                                        >
                                            <QuestionsCard
                                                item={item}
                                                fetchCourseContent={FetchCourseContent}
                                                courseData={data}
                                                contentId={courseContentData[activeVideo]?._id}
                                            />
                                        </Animated.View>
                                    ))}
                            </View>
                        </Animated.View>
                    )}
                    
                    {activeButton === "Reviews" && (
                        <Animated.View 
                            style={[
                                styles.contentContainer,
                                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                            ]}
                        >
                            {!reviewAvailable && (
                                <View style={styles.inputContainer}>
                                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                                        <Text
                                            style={{
                                                fontSize: 16,
                                                fontWeight: "600",
                                                paddingRight: 10
                                            }}
                                        >
                                            Đánh giá:
                                        </Text>
                                        <View style={{flexDirection: 'row'}}>
                                            {RenderStars()}
                                        </View>
                                    </View>
                                    <TextInput
                                        value={review}
                                        onChangeText={(v) => setReview(v)}
                                        placeholder="Chia sẻ đánh giá của bạn về khóa học..."
                                        style={styles.input}
                                        multiline
                                    />
                                    <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 15 }}>
                                        <TouchableOpacity
                                            disabled={review === ""}
                                            onPress={() => OnHandleReviewSubmit()}
                                        >
                                            <LinearGradient
                                                colors={review === "" ? ['#a0a0a0', '#888888'] : ['#E56767', '#D84848']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                style={styles.actionButton}
                                            >
                                                <Text style={styles.textBtn}>Gửi đánh giá</Text>
                                                <AntDesign name="star" size={16} color="white" />
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                            
                            <View style={{ rowGap: 15 }}>
                                {courseReviews.map((item: ReviewType, index: number) => (
                                    <Animated.View 
                                        key={`${index}-efa`}
                                        style={{ 
                                            opacity: fadeAnim, 
                                            transform: [{ translateY: slideAnim }] 
                                        }}
                                    >
                                        <ReviewCard item={item} />
                                    </Animated.View>
                                ))}
                            </View>
                        </Animated.View>
                    )}
                </ScrollView>
            )}
            
            <Modal
                visible={isLessonListVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsLessonListVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Danh sách bài học</Text>
                            <TouchableOpacity onPress={() => setIsLessonListVisible(false)}>
                                <AntDesign name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        
                        <FlatList
                            data={courseContentData}
                            keyExtractor={(item, index) => `lesson-${index}`}
                            renderItem={({ item, index }) => (
                                <TouchableOpacity 
                                    style={[
                                        styles.lessonItem,
                                        activeVideo === index && styles.activeLesson
                                    ]}
                                    onPress={() => handleLessonSelect(index)}
                                >
                                    <View style={styles.lessonNumber}>
                                        <Text style={styles.lessonNumberText}>{index + 1}</Text>
                                    </View>
                                    <Text style={styles.lessonTitle} numberOfLines={2}>{item.title}</Text>
                                    {isLessonCompleted(item._id) && (
                                        <Feather name="check-circle" size={20} style={styles.completedIcon} />
                                    )}
                                </TouchableOpacity>
                            )}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                </View>
            </Modal>
        </>
    )
}

export default CourseAccessScreen;