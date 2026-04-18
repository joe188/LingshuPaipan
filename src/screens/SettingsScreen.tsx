/**
 * 设置页面 - AI 配置
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface AIConfig {
  provider: 'openai' | 'wenxin' | 'tongyi' | 'xinghuo' | 'custom';
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

const PROVIDERS = [
  { label: 'OpenAI', value: 'openai', defaultModel: 'gpt-3.5-turbo' },
  { label: '文心一言', value: 'wenxin', defaultModel: 'ERNIE-Bot-turbo' },
  { label: '通义千问', value: 'tongyi', defaultModel: 'qwen-turbo' },
  { label: '讯飞星火', value: 'xinghuo', defaultModel: 'generalv3' },
  { label: '自定义', value: 'custom', defaultModel: '' },
];

const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [config, setConfig] = useState<AIConfig>({
    provider: 'openai',
    apiKey: '',
    baseUrl: '',
    model: 'gpt-3.5-turbo',
  });
  const [models, setModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const saved = await AsyncStorage.getItem('ai_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        setConfig(parsed);
      }
    } catch (error) {
      console.log('加载配置失败:', error);
    }
  };

  const saveConfig = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem('ai_config', JSON.stringify(config));
      Alert.alert('成功', '配置已保存');
    } catch (error) {
      Alert.alert('错误', '保存失败');
    }
  };

  const fetchModels = async () => {
    if (!config.apiKey) {
      Alert.alert('提示', '请先输入 API Key');
      return;
    }

    setLoading(true);
    try {
      let url = '';
      let headers: any = {
        'Content-Type': 'application/json',
      };

      switch (config.provider) {
        case 'openai':
          url = config.baseUrl || 'https://api.openai.com/v1/models';
          headers['Authorization'] = `Bearer ${config.apiKey}`;
          break;
        case 'wenxin':
          // 文心一言需要获取 token
          Alert.alert('提示', '文心一言暂不支持模型列表获取');
          setLoading(false);
          return;
        case 'tongyi':
          url = 'https://dashscope.aliyuncs.com/api/v1/models';
          headers['Authorization'] = `Bearer ${config.apiKey}`;
          break;
        case 'xinghuo':
          Alert.alert('提示', '讯飞星火暂不支持模型列表获取');
          setLoading(false);
          return;
        case 'custom':
          if (!config.baseUrl) {
            Alert.alert('提示', '请输入自定义 Base URL');
            setLoading(false);
            return;
          }
          url = `${config.baseUrl}/models`;
          headers['Authorization'] = `Bearer ${config.apiKey}`;
          break;
      }

      const response = await fetch(url, { headers });
      const data = await response.json();

      if (data.data) {
        const modelIds = data.data.map((m: any) => m.id || m.name);
        setModels(modelIds);
        Alert.alert('成功', `获取到 ${modelIds.length} 个模型`);
      } else {
        Alert.alert('错误', '获取模型列表失败');
      }
    } catch (error: any) {
      Alert.alert('错误', `获取失败：${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    if (!config.apiKey) {
      Alert.alert('提示', '请先输入 API Key');
      return;
    }

    setTesting(true);
    try {
      const aiService = require('../services/ai-service').default;
      
      const testRequest = {
        question: '你好',
        provider: config.provider,
        apiKey: config.apiKey,
        baseUrl: config.baseUrl,
        model: config.model,
      };

      const result = await aiService.testConnection(testRequest);
      
      if (result.success) {
        Alert.alert('✅ 成功', '连接测试成功！');
      } else {
        Alert.alert('❌ 失败', result.error || '连接失败');
      }
    } catch (error: any) {
      Alert.alert('❌ 错误', `测试失败：${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  const renderProviderSettings = () => {
    switch (config.provider) {
      case 'openai':
        return (
          <View>
            <Text style={styles.label}>API Key</Text>
            <TextInput
              style={styles.input}
              value={config.apiKey}
              onChangeText={(text) => setConfig({ ...config, apiKey: text })}
              placeholder="sk-..."
              secureTextEntry
            />
            <Text style={styles.label}>Base URL (可选)</Text>
            <TextInput
              style={styles.input}
              value={config.baseUrl}
              onChangeText={(text) => setConfig({ ...config, baseUrl: text })}
              placeholder="https://api.openai.com/v1"
            />
          </View>
        );

      case 'wenxin':
        return (
          <View>
            <Text style={styles.label}>API Key</Text>
            <TextInput
              style={styles.input}
              value={config.apiKey}
              onChangeText={(text) => setConfig({ ...config, apiKey: text })}
              placeholder="文心一言 API Key"
              secureTextEntry
            />
            <Text style={styles.label}>Secret Key</Text>
            <TextInput
              style={styles.input}
              value={config.baseUrl}
              onChangeText={(text) => setConfig({ ...config, baseUrl: text })}
              placeholder="文心一言 Secret Key"
              secureTextEntry
            />
          </View>
        );

      case 'tongyi':
        return (
          <View>
            <Text style={styles.label}>API Key</Text>
            <TextInput
              style={styles.input}
              value={config.apiKey}
              onChangeText={(text) => setConfig({ ...config, apiKey: text })}
              placeholder="通义千问 API Key"
              secureTextEntry
            />
          </View>
        );

      case 'xinghuo':
        return (
          <View>
            <Text style={styles.label}>API Key</Text>
            <TextInput
              style={styles.input}
              value={config.apiKey}
              onChangeText={(text) => setConfig({ ...config, apiKey: text })}
              placeholder="讯飞星火 API Key"
              secureTextEntry
            />
          </View>
        );

      case 'custom':
        return (
          <View>
            <Text style={styles.label}>Base URL</Text>
            <TextInput
              style={styles.input}
              value={config.baseUrl}
              onChangeText={(text) => setConfig({ ...config, baseUrl: text })}
              placeholder="http://localhost:8080/v1"
            />
            <Text style={styles.label}>API Key</Text>
            <TextInput
              style={styles.input}
              value={config.apiKey}
              onChangeText={(text) => setConfig({ ...config, apiKey: text })}
              placeholder="任意字符串"
              secureTextEntry
            />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>AI 配置</Text>

      <Text style={styles.label}>AI 服务商</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={config.provider}
          onValueChange={(value) => {
            const provider = PROVIDERS.find(p => p.value === value);
            setConfig({
              ...config,
              provider: value as any,
              model: provider?.defaultModel || '',
            });
          }}
          style={styles.picker}
        >
          {PROVIDERS.map(p => (
            <Picker.Item key={p.value} label={p.label} value={p.value} />
          ))}
        </Picker>
      </View>

      {renderProviderSettings()}

      <Text style={styles.label}>模型</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={config.model}
          onValueChange={(text) => setConfig({ ...config, model: text })}
          style={styles.picker}
        >
          {models.length > 0 ? (
            models.map(m => (
              <Picker.Item key={m} label={m} value={m} />
            ))
          ) : (
            <Picker.Item label={config.model || '默认模型'} value={config.model || 'default'} />
          )}
        </Picker>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={fetchModels}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>获取模型列表</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, testing && styles.buttonDisabled]}
          onPress={testConnection}
          disabled={testing}
        >
          {testing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>测试连接</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={saveConfig}>
        <Text style={styles.saveButtonText}>保存配置</Text>
      </TouchableOpacity>

      <View style={styles.helpContainer}>
        <Text style={styles.helpTitle}>💡 使用说明</Text>
        <Text style={styles.helpText}>
          1. 选择 AI 服务商并填写 API Key{'\n'}
          2. 点击"获取模型列表"查看可用模型{'\n'}
          3. 点击"测试连接"验证配置{'\n'}
          4. 点击"保存配置"保存设置
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    flex: 1,
    backgroundColor: '#667eea',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  helpContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
});

export default SettingsScreen;
